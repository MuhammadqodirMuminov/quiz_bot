import TelegramBot from 'node-telegram-bot-api';
import { bot } from '../config/bot.config';
import { ADMIN_PASS } from '../config/environment.config';
import { ms } from '../constants';
import adminService from '../services/admin.service';
import { extractUniqueCode, mp } from '../utils';
import path from 'path';
import fs from 'fs';
import userModule from './user.module';

class AdminmModule {
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

	private async admin_options(chatId: number, username: string) {
		await this.bot.sendMessage(chatId, `Admin : ${username}`, {
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
				bot.sendMessage(chatId, ms.notAdmin, { parse_mode: 'Markdown' });
			}

			const replyMsg = await this.bot.sendMessage(chatId, ms.mailUsersMsg, {
				parse_mode: 'Markdown',
				reply_markup: mp.cancelMail,
			});

			await this.add_media_to_mail(replyMsg, messageContent);
		});
	}

	private async add_media_to_mail(
		msg: TelegramBot.Message,
		messageContent: any
	) {
		const chatId = msg.chat.id;
		try {
			const { success } = await adminService.isAdmin(chatId);
			if (!success) {
				await this.admin_options(chatId, msg.chat.username || '');
			}

			if (msg.text === 'cancel_mail') {
				this.admin_options(chatId, msg.chat.username as string);
			} else {
				messageContent['text'] = msg.text;
				const replyMsg = await this.bot.sendMessage(
					chatId,
					"Attach media - 1\nDon't attach media - 0",
					{ reply_markup: mp.cancelMail, parse_mode: 'Markdown' }
				);
				await this.mail_users_send(replyMsg, messageContent);
			}
		} catch (error: any) {
			await this.bot.sendMessage(chatId, `Error: ${error?.message}`, {
				parse_mode: 'Markdown',
			});
		}
	}

	private async mail_users_send(msg: TelegramBot.Message, messageContent: any) {
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
				const replyMsg = await this.bot.sendMessage(
					chatId,
					'Press push to send, cancel to cancel',
					{ parse_mode: 'HTML' }
				);
				await this.confirm_mail(replyMsg, messageContent);
			} else if (msg.text === '1') {
				messageContent['status'] = 'mail';
				const replyMsg = await this.bot.sendMessage(
					chatId,
					'Attach file\n\n.jpg .jpeg .mp4'
				);
				this.handler_file(replyMsg, messageContent);
			}
		} catch (error: any) {
			await this.bot.sendMessage(chatId, error.message, {
				parse_mode: 'Markdown',
			});
		}
	}

	private async confirm_mail(msg: TelegramBot.Message, messageContent: any) {
		const chatId = msg.chat.id;
		try {
			if (msg.text == 'cancel_mail') {
				await this.admin_options(chatId, msg.chat.username || '');
			} else if (msg.text === 'push') {
				const media = fs.createReadStream(messageContent['src']);

				userModule.sendAllUser(
					chatId,
					messageContent['text'],
					media,
					messageContent['media_type']
				);
			}
		} catch (error: any) {
			await this.bot.sendMessage(chatId, error.message, {
				parse_mode: 'Markdown',
			});
		}
	}

	async handler_file(msg: TelegramBot.Message, messageContent: any) {
		const chatId = msg.chat.id;

		try {
			const { success } = await adminService.isAdmin(chatId);
			if (success) {
				const dir = path.join(__dirname, 'files', String(chatId));
				fs.mkdirSync(dir, { recursive: true });

				if (messageContent.status === 'mail') {
					if (msg.photo) {
						const fileId = msg.photo[msg.photo.length - 1].file_id;
						const fileLink = await this.bot.getFileLink(fileId);
						const response = await (await fetch(fileLink)).arrayBuffer();
						const filePath = path.join(process.env.AD_PWD!, 'mail.jpg');
						4;
						fs.writeFileSync(filePath, Buffer.from(response));
						messageContent.src = filePath;
						messageContent.media_type = 'jpg';

						bot.sendMessage(chatId, 'Image loaded');
						bot.sendPhoto(chatId, filePath, { caption: messageContent.text });
					}

					if (msg.video) {
						const fileId = msg.video.file_id;
						const fileLink = await bot.getFileLink(fileId);
						const response = await (await fetch(fileLink)).arrayBuffer();
						const filePath = path.join(process.env.AD_PWD!, 'mail.mp4');

						fs.writeFileSync(filePath, Buffer.from(response));
						messageContent.src = filePath;
						messageContent.media_type = 'mp4';

						bot.sendMessage(chatId, 'Video uploaded');
						bot.sendVideo(chatId, filePath, { caption: messageContent.text });
					}

					bot.sendMessage(chatId, 'Press push to send, cancel to cancel');
					// Register next step handler logic here if needed
				} else {
					console.log('Other status handling');
					// Handle other statuses similarly
				}
			}
		} catch (error) {
			console.error('Error processing file:', error);
		}
	}

	init() {
		this.admin();
		this.stat();
		this.mail_users();
	}
}

export default new AdminmModule(bot);
