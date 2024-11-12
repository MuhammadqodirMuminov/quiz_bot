import TelegramBot from 'node-telegram-bot-api';
import { bot } from '../config/bot.config';

class SubscriptionModule {
	private bot: TelegramBot;
	constructor(bot: TelegramBot) {
		this.bot = bot;
	}

	async subscribe() {
		this.bot.onText(/\/subscription/, async (msg) => {
			const chatId = msg.chat.id;
      
		});
	}

	initModule() {}
}

export default new SubscriptionModule(bot);
