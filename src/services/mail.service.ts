import TelegramBot from 'node-telegram-bot-api';
import { bot } from '../config/bot.config';
import adminService from './admin.service';
import { mp } from '../utils';
import userModule from '../commands/user.module';
import { IFile } from '../models/file.schema';
import fileService from './file.service';
import { FileTypes } from '../types';

class MailService {
	private bot: TelegramBot;
	constructor(bot: TelegramBot) {
		this.bot = bot;
	}

	async add_media_to_mail(messageContent: any) {
		this.bot.once('message', async (msg) => {
			const chatId = msg.chat.id;

			try {
				const { success } = await adminService.isAdmin(chatId);
				if (!success) {
					return await this.admin_options(chatId, msg.chat.username || '');
				}

				if (msg.text === 'cancel_mail') {
					return await this.admin_options(chatId, msg.chat.username as string);
				} else {
					messageContent['text'] = msg.text;

					this.bot
						.sendMessage(chatId, "Attach media - 1\nDon't attach media - 0", {
							reply_markup: mp.cancelMail,
							parse_mode: 'Markdown',
						})
						.then(() => {
							this.mail_users_send(messageContent);
						});
				}
			} catch (error: any) {
				await this.bot.sendMessage(chatId, `Error: ${error?.message}`, {
					parse_mode: 'Markdown',
				});
			}
		});
	}

	private async mail_users_send(messageContent: any) {
		this.bot.once('message', async (msg) => {
			const chatId = msg.chat.id;

			try {
				const { success } = await adminService.isAdmin(chatId);
				if (!success) {
					await this.admin_options(chatId, msg.chat.username || '');
				}

				if (msg.text === 'cancel_mail') {
					await this.admin_options(chatId, msg.chat.username || '');
				} else if (msg.text === '0') {
					messageContent['status'] = '';
					await this.bot.sendMessage(chatId, messageContent['text'], {
						parse_mode: 'HTML',
						reply_markup: mp.cancelAndPushMail,
					});
					await this.bot
						.sendMessage(chatId, 'Press push to send, cancel to cancel', {
							parse_mode: 'HTML',
							reply_markup: mp.cancelAndPushMail,
						})
						.then(() => this.confirm_mail(messageContent));
				} else if (msg.text === '1') {
					messageContent['status'] = 'mail';
					await this.bot
						.sendMessage(chatId, 'Attach file\n\n.jpg .jpeg .mp4')
						.then(() => {
							this.handler_file(messageContent);
						});
				}
			} catch (error: any) {
				await this.bot.sendMessage(chatId, error.message, {
					parse_mode: 'Markdown',
				});
			}
		});
	}

	private async confirm_mail(messageContent: any) {
		this.bot.once('message', async (msg) => {
			const chatId = msg.chat.id;

			try {
				if (msg.text == 'cancel_mail') {
					return await this.admin_options(chatId, msg.chat.username || '');
				} else if (msg.text === 'push_mail') {
					const media = messageContent['src'];

					await userModule.sendAllUser(
						chatId,
						messageContent['text'],
						media,
						messageContent['media_type']
					);
				}
			} catch (error: any) {
				await this.bot.sendMessage(chatId, error.message);
			}
		});
	}

	async handler_file(messageContent: any) {
		this.bot.once('message', async (msg) => {
			const chatId = msg.chat.id;

			try {
				const { success } = await adminService.isAdmin(chatId);

				if (success) {
					let image: IFile | undefined = undefined;
					const fileId = msg.photo?.at(-1)?.file_id;
					const documentFileId = msg.document?.file_id;
					const videoId = msg.video?.file_id;

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
						messageContent['media_type'] = FileTypes.DOCUMENT;
					} else if (videoId) {
						image = await fileService.createFile({
							fileType: FileTypes.VIDEO,
							fileId: videoId,
						});
						messageContent['media_type'] = FileTypes.VIDEO;
					}

					if (messageContent.status === 'mail') {
						if (msg.photo) {
							await bot.sendPhoto(chatId, image?.fileId!, {
								caption: messageContent.text,
							});
						}

						if (msg.video) {
							await bot.sendMessage(chatId, 'Video uploaded');
							await bot.sendVideo(chatId, image?.fileId!, {
								caption: messageContent.text,
								reply_markup: mp.offMarkup,
							});
						}

						if (msg.document) {
							await bot.sendMessage(chatId, 'Document uploaded');
							await bot.sendDocument(chatId, image?.fileId!, {
								caption: messageContent.text,
								reply_markup: mp.offMarkup,
							});
						}

						messageContent['src'] = image?.fileId;
						bot
							.sendMessage(chatId, 'Press push to send, cancel to cancel', {
								reply_markup: mp.cancelAndPushMail,
								parse_mode: 'HTML',
							})
							.then(() => this.confirm_mail(messageContent));
					} else {
						console.log('Other status handling');
					}
				}
			} catch (error) {
				console.error('Error processing file:', error);
			}
		});
	}

	async admin_options(chatId: number, username: string) {
		return await this.bot.sendMessage(chatId, `Admin : ${username}`, {
			parse_mode: 'Markdown',
			reply_markup: mp.adminMenu,
		});
	}
}

export default new MailService(bot);
