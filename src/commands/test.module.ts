import TelegramBot from 'node-telegram-bot-api';
import { bot } from '../config/bot.config';
import { ms } from '../constants';
import { IFile } from '../models/file.schema';
import { ITest } from '../models/test.model';
import adminService from '../services/admin.service';
import fileService from '../services/file.service';
import testService from '../services/test.service';
import { FileTypes } from '../types';
import { mp } from '../utils';
import userModule from './user.module';

export class TestModule {
	private bot: TelegramBot;
	constructor(bot: TelegramBot) {
		this.bot = bot;
	}

	private test() {
		this.bot.onText(/\/test/, async (msg) => {
			const chatId = msg.chat.id;

			try {
				const { success } = await adminService.isAdmin(chatId);

				if (success) {
					this.testOptions(chatId).then((_) => {
						this.handleName();
					});
				} else {
					await this.bot.sendMessage(chatId, ms.notAdmin, {
						parse_mode: 'Markdown',
					});
				}
			} catch (error: any) {
				this.bot.sendMessage(chatId, `Error: ${error?.message}`, {
					parse_mode: 'Markdown',
				});
			}
		});
	}

	private async handleName() {
		this.bot.once('message', async (msg) => {
			const chatId = msg.chat.id;
			const text = msg.text?.trim();

			const { success } = await adminService.isAdmin(chatId);
			if (success) {
				if (text == '/create') {
					this.bot
						.sendMessage(chatId, ms.test.name, {
							reply_markup: { remove_keyboard: true },
						})
						.then(() => {
							this.createTest();
						});
				} else if (text == '/getAll') {
					const tests = await testService.getAll();

					await Promise.all(
						tests.map(async (test) => {
							this.sendImageOrDocument(test, chatId, () => {}, {
								parse_mode: 'Markdown',
								reply_markup: mp.testInlineButton(test.code),
								caption: ms.test.card(test.code, test.name, test.count),
							});
						})
					);

					await this.bot
						.sendMessage(chatId, ms.testHomeMessage, {
							reply_markup: mp.adminMenu,
						})
						.then(() => this.sendTest());
				}
			}
		});
	}

	private async sendTest() {
		this.bot.on('callback_query', async (msg) => {
			const data = msg.data;
			const chatId = msg.message?.chat.id;
			if (data && chatId) {
				const code = data.split('_')[2];
				const existTest = await testService.getOne({ code: code });

				if (existTest && data.startsWith('send_test_')) {
					userModule.sendAllUser(
						chatId,
						ms.test.card(existTest.code, existTest.name, existTest.count),
						existTest.image.fileId!,
						''
					);
				}
				if (existTest && data.startsWith('edit_test_')) {
					await testService.update(String(existTest._id), {
						isPublished: !existTest.isPublished,
					});
					this.bot.deleteMessage(chatId, msg.message?.message_id!);
					this.bot.sendMessage(
						chatId,
						`Test code: <code>${existTest.code}</code>\n<p>Test successfully deleted!</p>`,
						{
							parse_mode: 'HTML',
						}
					);
				}
			}
		});
	}

	private async createTest() {
		this.bot.once('message', async (msg) => {
			const chatId = msg.chat.id;
			const name = msg.text;

			const newTest = await testService.createTest({
				name,
			});

			this.bot.sendMessage(chatId, ms.test.text).then(() => {
				this.handleText(newTest.code);
			});
		});
	}

	private handleText(code: number) {
		this.bot.once('message', async (msg) => {
			const chatId = msg.chat.id;
			const text = msg.text;

			const existTest = await testService.getOne({ code: code });

			if (existTest) {
				const success = await testService.update(String(existTest._id), {
					text,
				});

				if (success) {
					this.bot.sendMessage(chatId, ms.test.image).then(() => {
						this.handleImage(existTest.code);
					});
				}
			}
		});
	}

	private handleImage(code: number) {
		this.bot.once('message', async (msg) => {
			let image: IFile | undefined = undefined;
			const chatId = msg.chat.id;
			const fileId = msg.photo?.at(-1)?.file_id;
			const documentFileId = msg.document?.file_id;

			if (fileId) {
				image = await fileService.createFile({
					fileType: FileTypes.IMAGE,
					fileId,
				});
			} else if (documentFileId) {
				image = await fileService.createFile({
					fileType: FileTypes.DOCUMENT,
					fileId: documentFileId,
				});
			}

			const existTest = await testService.getOne({ code: code });

			if (existTest) {
				const success = await testService.update(String(existTest._id), {
					image: image,
				});

				if (success) {
					this.bot.sendMessage(chatId, ms.test.answers).then(() => {
						this.handleAnswers(existTest.code);
					});
				}
			}
		});
	}

	private handleAnswers(code: number) {
		this.bot.once('message', async (msg) => {
			const chatId = msg.chat.id;

			const answers = msg.text?.trim().toLowerCase();
			const count = answers?.length;

			const existTest = await testService.getOne({ code: code });

			if (existTest) {
				const success = await testService.update(String(existTest._id), {
					answers,
					count,
				});

				if (success) {
					this.sendImageOrDocument(
						existTest,
						chatId,
						() => {
							this.handleSave(existTest.code);
						},
						{
							caption: ms.test.card(
								existTest.code,
								existTest.name,
								existTest.count
							),
							parse_mode: 'Markdown',
							reply_markup: mp.testSaveMenu,
						}
					);
				}
			}
		});
	}

	private handleSave(code: number) {
		this.bot.once('message', async (msg) => {
			const chatId = msg.chat.id;
			const text = msg.text?.trim();

			const existTest = await testService.getOne({ code: code });
			if (existTest) {
				const success = await testService.update(String(existTest._id), {
					isPublished: true,
				});
				if (success) {
					if (text == '/save') {
						this.sendImageOrDocument(existTest, chatId, () => {}, {
							caption: ms.test.card(
								existTest.code,
								existTest.name,
								existTest.count
							),
							parse_mode: 'Markdown',
							reply_markup: mp.adminMenu,
						});
					} else if (text == '/saveAndSend') {
						//send a this test to users and give starts and redirect to admin page
						this.sendImageOrDocument(existTest, chatId, () => {}, {
							caption: ms.test.card(
								existTest.code,
								existTest.name,
								existTest.count
							),
							parse_mode: 'Markdown',
							reply_markup: mp.adminMenu,
						});
						userModule.sendAllUser(
							chatId,
							ms.test.card(existTest.code, existTest.name, existTest.count),
							existTest.image.fileId!,
							''
						);
					} else {
						this.bot.sendMessage(chatId, 'Invalid command', {
							parse_mode: 'Markdown',
							reply_markup: mp.adminMenu,
						});
					}
				}
			}
		});
	}

	private sendImageOrDocument(
		existTest: ITest,
		chatId: number,
		cb: () => void,
		options: TelegramBot.SendPhotoOptions
	) {
		if (existTest.image.fileType === FileTypes.IMAGE) {
			this.bot.sendPhoto(chatId, existTest.image.fileId, options).then(cb);
		} else if (existTest.image.fileType === FileTypes.DOCUMENT) {
			this.bot.sendDocument(chatId, existTest.image.fileId, options).then(cb);
		}
	}

	private async testOptions(chatId: number) {
		await this.bot.sendMessage(chatId, ms.testHomeMessage, {
			parse_mode: 'Markdown',
			reply_markup: mp.testMenu,
		});
	}

	init() {
		this.test();
	}
}

export default new TestModule(bot);
