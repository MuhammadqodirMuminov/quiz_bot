import TelegramBot from 'node-telegram-bot-api';
import { bot } from '../config/bot.config';
import userService from '../services/user.service';
import { ReadStream } from 'fs';

class UserModule {
	private bot: TelegramBot;

	constructor(bot: TelegramBot) {
		this.bot = bot;
	}

	async sendAllUser(
		adminChatId: number,
		text: string,
		media: ReadStream,
		mediaType: string
	) {
		const users = await userService.getAll({});
		let sended = 0;
		let unSended = 0;
		users.forEach(async (user) => {
			try {
				if (media) {
					if (mediaType === 'mp4') {
						await this.bot.sendVideo(user.chat_id, media, {
							caption: text,
							reply_markup: { remove_keyboard: true, selective: true },
						});
					} else {
						this.bot.sendPhoto(user.chat_id, media, {
							caption: text,
							reply_markup: { remove_keyboard: true, selective: true },
							parse_mode: 'Markdown',
						});
					}
				} else {
					await this.bot.sendMessage(user.chat_id, text, {
						parse_mode: 'Markdown',
					});
				}
				sended += 1;
			} catch (error) {
				unSended += 1;
			}
		});
		await this.bot.sendMessage(
			adminChatId,
			`Sent ${sended}\n  Not Sent ${unSended}`,
			{ parse_mode: 'Markdown' }
		);
	}
	initModule() {}
}

export default new UserModule(bot);
