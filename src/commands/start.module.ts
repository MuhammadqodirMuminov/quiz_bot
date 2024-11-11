import TelegramBot from 'node-telegram-bot-api';
import { bot } from '../config/bot.config';
import userService from '../services/user.service';
import { mp } from '../utils';

class StartModule {
	private bot: TelegramBot;

	constructor(bot: TelegramBot) {
		this.bot = bot;
	}

	private start() {
		this.bot.onText(/\/start/, async msg => {
			const chatId = msg.chat.id;

			await userService.create({ chat_id: chatId, username: msg.chat.username, date_of_join: new Date() });

			this.bot.sendMessage(chatId, 'Hello! I am Quiz Bot. Type /help for more info.', { reply_markup: mp.userMenu });
		});
	}

	setCommands() {
		this.bot.setMyCommands([
			{ command: '/start', description: 'Start the bot' },
			{ command: '/admin', description: 'Admins approved' },
			{ command: '/help', description: 'Bot helps and sitemaps' },
		]);
	}

	init() {
		this.start();
		this.setCommands();
	}
}

export default new StartModule(bot);
