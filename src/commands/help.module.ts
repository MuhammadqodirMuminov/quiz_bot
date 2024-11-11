import TelegramBot from 'node-telegram-bot-api';
import { bot } from '../config/bot.config'

class HelpModule {
	private bot: TelegramBot;

	constructor(bot: TelegramBot) {
		this.bot = bot;
	}

	help() {
		this.bot.onText(/\/help/, msg => {
			const chatId = msg.chat.id;
			this.bot.sendMessage(chatId, 'Available commands: /start, /help');
		});
	}

	init() {
        this.help();
    }
}

export default new HelpModule(bot);
