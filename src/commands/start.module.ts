import TelegramBot from 'node-telegram-bot-api';
import { bot } from '../config/bot.config';

class StartModule {
	private bot: TelegramBot;

	constructor(bot: TelegramBot) {
		this.bot = bot;
	}

	private start() {
		this.bot.onText(/\/start/, async msg => {
			const chatId = msg.chat.id;
			this.bot.sendMessage(chatId, 'HI!');
		});
	}

	setCommands() {
		this.bot.setMyCommands([{ command: '/start', description: 'Start the bot' }]);
	}

	init() {
		this.start();
		this.setCommands();
	}
}

export default new StartModule(bot);
