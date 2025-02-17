import TelegramBot from 'node-telegram-bot-api';
import { bot } from '../config/bot.config';
import { ADMIN_PASS } from '../config/environment.config';
import { ms } from '../constants';
import adminService from '../services/admin.service';
import adsService from '../services/ads.service';
import mailService from '../services/mail.service';
import subscribeService from '../services/subscribe.service';
import testService from '../services/test.service';
import userService from '../services/user.service';
import { extractUniqueCode, mp } from '../utils';

class AdminModule {
	private bot: TelegramBot;
	constructor(bot: TelegramBot) {
		this.bot = bot;
	}

	admin() {
		this.bot.onText(/\/(admin|admin_menu)/, async (msg) => {
			const chatId = msg.chat.id;
			const username = msg.from?.username || 'User';
			try {
				const code = extractUniqueCode(msg.text!);
				const { success } = await adminService.isAdmin(chatId);

				if (success) {
					await this.admin_options(chatId, username);
				} else if (!success && code == ADMIN_PASS) {
					await adminService.create({ chat_id: chatId, username });
					await this.admin_options(chatId, username);
				} else {
					await this.bot.sendMessage(chatId, ms.notAdmin, {
						parse_mode: 'Markdown',
					});
				}
			} catch (error: any) {
				console.log(error);

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
				const { success } = await adminService.isAdmin(chatId);
				if (success) {
					const users = (await userService.getAll({})).length;
					const admins = (await adminService.getAllAdmins({})).length;
					const tests = (await testService.getAll()).length;
					const subscriptions = (await subscribeService.getOne()).channels
						.length;
					await this.bot.sendMessage(
						chatId,
						ms.adminStat(users, admins, tests, subscriptions),
						{
							parse_mode: 'Markdown',
							reply_markup: mp.adminMenu,
						}
					);
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

	async admin_options(chatId: number, username: string) {
		return await this.bot.sendMessage(chatId, 'Admin', {
			reply_markup: mp.adminMenu,
			parse_mode: 'Markdown',
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
					mailService.add_media_to_mail(messageContent);
				});
		});
	}

	private ads() {
		this.bot.onText(/\/ads/, async (msg) => {
			const chatId = msg.chat.id;
			try {
				const { success } = await adminService.isAdmin(chatId);

				if (success) {
					const adsStatus = adsService.adsStatus;
					await this.bot.sendMessage(chatId, ms.adminStatus(adsStatus), {
						reply_markup: mp.adsMenu,
					});
					return;
				} else {
					await this.bot.sendMessage(chatId, ms.notAdmin, {
						parse_mode: 'Markdown',
					});

					return;
				}
			} catch (error: any) {
				this.bot.sendMessage(chatId, `Error: ${error?.message}`, {
					parse_mode: 'Markdown',
				});
			}
		});
	}

	init() {
		this.admin();
		this.stat();
		this.mail_users();
		this.ads();
	}
}

export default new AdminModule(bot);
