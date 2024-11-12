import TelegramBot from 'node-telegram-bot-api';
import { bot } from '../config/bot.config';
import userService from '../services/user.service';
import { ReadStream } from 'fs';
import { FileTypes } from '../types';
import { mp } from '../utils';

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

		for (const user of users) {
			try {
				if (media) {
					if (mediaType === 'mp4') {
						await this.bot.sendVideo(user.chat_id, media, {
							caption: text,
							reply_markup: mp.offMarkup,
							parse_mode: 'Markdown',
						});
					} else if (mediaType === FileTypes.DOCUMENT) {
						await this.bot.sendDocument(user.chat_id, media, {
							caption: text,
							reply_markup: mp.offMarkup,
						});
					} else {
						await this.bot.sendPhoto(user.chat_id, media, {
							caption: text,
							reply_markup: mp.offMarkup,
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
		}

		await this.bot.sendMessage(
			adminChatId,
			`Sent ${sended} \nNot Sent ${unSended}`,
			{ parse_mode: 'Markdown', reply_markup: mp.adminMenu }
		);
	}
	initModule() {}
}

export default new UserModule(bot);
