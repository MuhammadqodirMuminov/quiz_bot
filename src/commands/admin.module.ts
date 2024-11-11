import TelegramBot from 'node-telegram-bot-api';
import { bot } from '../config/bot.config';
import { ADMIN_PASS } from '../config/environment.config';
import { ms } from '../constants';
import adminService from '../services/admin.service';
import { extractUniqueCode, mp } from '../utils';

class AdminmModule {
	private bot: TelegramBot;
	constructor(bot: TelegramBot) {
		this.bot = bot;
	}

	admin() {
		this.bot.onText(/\/(admin|admin_menu)/, async msg => {
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
					await this.bot.sendMessage(chatId, ms.notAdmin, { parse_mode: 'Markdown' });
				}
			} catch (error: any) {
				this.bot.sendMessage(chatId, `Error: ${error?.message}`, { parse_mode: 'Markdown' });
			}
		});
	}

	async stat() {
		this.bot.onText(/\/stat/, async msg => {
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
				this.bot.sendMessage(chatId, `Error: ${error?.message}`, { parse_mode: 'Markdown' });
			}
		});
	}

	private async admin_options(chatId: number, username: string) {
		await this.bot.sendMessage(chatId, `Admin : ${username}`, {
			parse_mode: 'Markdown',
			reply_markup: mp.adminMenu,
		});
	}

	init() {
		this.admin();
		this.stat();
	}
}

export default new AdminmModule(bot);
