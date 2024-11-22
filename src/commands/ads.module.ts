import TelegramBot from 'node-telegram-bot-api';
import { bot } from '../config/bot.config';
import { ms } from '../constants';
import adminService from '../services/admin.service';
import adsService from '../services/ads.service';
import { mp } from '../utils';

class AdsModule {
	private bot: TelegramBot;
	constructor(bot: TelegramBot) {
		this.bot = bot;
	}

	private turnOnAds() {
		this.bot.onText(/\/turn_on_ads/, async msg => {
			const chatId = msg.chat.id;
			try {
				const { success } = await adminService.isAdmin(chatId);

				if (success) {
					adsService.adsStatus = true;
					await this.bot.sendMessage(
						chatId,
						ms.adsOnMessage(adsService.adsStatus),
						{
							reply_markup: mp.adsMenu,
							parse_mode: 'Markdown',
						},
					);
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

	private turnOfAds() {
		this.bot.onText(/\/turn_off_ads/, async msg => {
			const chatId = msg.chat.id;
			try {
				const { success } = await adminService.isAdmin(chatId);

				if (success) {
					adsService.adsStatus = false;
					await this.bot.sendMessage(
						chatId,
						ms.adsOnMessage(adsService.adsStatus),
						{
							reply_markup: mp.adsMenu,
							parse_mode: 'Markdown',
						},
					);
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

	private newAds() {
		this.bot.onText(/\/new_ad/, async msg => {
			const chatId = msg.chat.id;
			const { success } = await adminService.isAdmin(chatId);
			try {
				if (success) {
					this.bot
						.sendMessage(chatId, ms.shortName(), {
							reply_markup: mp.adsMenu,
							parse_mode: 'Markdown',
						})
						.then(() => {
							this.handleShortname();
						});
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

	private handleShortname() {
		this.bot.once('message', async msg => {
			const chatId = msg.chat.id;
			const text = msg.text;

			const { success } = await adminService.isAdmin(chatId);

			if (success) {
				adsService.ads.shortName = text?.trim();
				this.bot
					.sendMessage(
						chatId,
						ms.adsData({ shortName: adsService.ads.shortName }),
						{ reply_markup: { remove_keyboard: true } },
					)
					.then(() => {
						this.handleText();
					});
			}
		});
	}

	private handleText() {
		this.bot.once('message', async msg => {
			const chatId = msg.chat.id;
			const text = msg.text;

			const { success } = await adminService.isAdmin(chatId);

			if (success) {
				adsService.ads.text = text;
				this.bot
					.sendMessage(
						chatId,
						ms.adsButton({ shortName: adsService.ads.shortName }),
						{
							reply_markup: { remove_keyboard: true },
						},
					)
					.then(() => {
						this.handleButton();
					});
			}
		});
	}

    private handleButton() {
        
    }

	init() {
		this.turnOnAds();
		this.turnOfAds();
		this.newAds();
	}
}

export default new AdsModule(bot);
