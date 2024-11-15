import fs from 'fs';
import TelegramBot from 'node-telegram-bot-api';
import path from 'path';
import { bot } from '../config/bot.config';
import { ADMIN_PASS } from '../config/environment.config';
import { ms } from '../constants';
import adminService from '../services/admin.service';
import { extractUniqueCode, mp } from '../utils';
import userModule from './user.module';
import { IFile } from '../models/file.schema';
import { FileTypes } from '../types';
import fileService from '../services/file.service';

class AdminModule {
	private bot: TelegramBot;
	constructor(bot: TelegramBot) {
		this.bot = bot;
	}

	admin() {
		this.bot.onText(/\/(admin|admin_menu)/, async (msg) => {
			const chatId = msg.chat.id;
			const username = msg.from?.username;
			try {
				const code = extractUniqueCode(msg.text!);
				const { success } = await adminService.isAdmin(chatId);

				if (success) {
					await this.admin_options(chatId, username || '');
				} else if (!success && code == ADMIN_PASS) {
					await adminService.create({ chat_id: chatId, username });
					await this.admin_options(chatId, username || '');
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

	async stat() {
		this.bot.onText(/\/stat/, async (msg) => {
			const chatId = msg.chat.id;
			try {
				// const { success } = await adminService.isAdmin(chatId);
				// if (success) {
				// 	const { data } = await downloadService.getStatistics();
				// 	const message = mp.getStatMsg(
				// 		data?.users!,
				// 		data?.users_today!,
				// 		data?.today_downloads!,
				// 		data?.today_downloads!,
				// 		data?.youtube!,
				// 		data?.tiktok!,
				// 		data?.instagram!,
				// 		data?.youtube!
				// 	);
				// 	await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown', reply_markup: mp.admin_menu });
				// } else {
				// 	await this.bot.sendMessage(chatId, ms.not_admin, { parse_mode: 'Markdown' });
				// }
			} catch (error: any) {
				this.bot.sendMessage(chatId, `Error: ${error?.message}`, {
					parse_mode: 'Markdown',
				});
			}
		});
	}

	async admin_options(chatId: number, username: string) {
		return await this.bot.sendMessage(chatId, `Admin : ${username}`, {
			parse_mode: 'Markdown',
			reply_markup: mp.adminMenu,
		});
	}

	private async mail_users() {
		this.bot.onText(/\/mail_users/, async (msg) => {
			const chatId = msg.chat.id;
			const { success } = await adminService.isAdmin(chatId);
			const messageContent = {};

			if (!success) {
				return await bot.sendMessage(chatId, ms.notAdmin, {
					parse_mode: 'Markdown',
				});
			}

			this.bot
				.sendMessage(chatId, ms.mailUsersMsg, {
					reply_markup: mp.cancelMail,
				})
				.then(() => {
					this.add_media_to_mail(messageContent);
				});
		});
	}

	private async add_media_to_mail(messageContent: any) {
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

					userModule.sendAllUser(
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
						messageContent['media_type'] = 'mp4';
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

	init() {
		this.admin();
		this.stat();
		this.mail_users();
	}
}

export default new AdminModule(bot);
