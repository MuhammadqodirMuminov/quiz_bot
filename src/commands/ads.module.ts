import TelegramBot from 'node-telegram-bot-api';
import adminService from '../services/admin.service';
import adsService from '../services/ads.service';
import { bot } from '../config/bot.config';
import { ms } from '../constants';
import { mp } from '../utils';

class AdsModule {
	private bot: TelegramBot;
	constructor(bot: TelegramBot) {
		this.bot = bot;
	}

	async subscribe() {
		this.bot.onText(/\/subscription/, async (msg) => {
			const chatId = msg.chat.id;

			try {
				const { success } = await adminService.isAdmin(chatId);

				if (success) {
					this.adsOptions(chatId).then(() => {
						this.adsManage();
					});
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

	private async adsManage() {
		this.bot.once('message', async (msg) => {
			const chatId = msg.chat.id;
			const text = msg.text?.trim();

			const { success } = await adminService.isAdmin(chatId);
			if (success) {
				if (text === '/create') {
					this.bot
						.sendMessage(chatId, ms.ads.channelName, {
							parse_mode: 'HTML',
							reply_markup: mp.offMarkup,
						})
						.then(() => this.adsCreate());
				} else if (text === '/getAll') {
					const ads = await adsService.getOne();

					if (ads?.channels.length) {
						for (const ad of ads?.channels) {
							this.bot.sendMessage(chatId, `Channel: @${ad}`, {
								parse_mode: 'HTML',
								reply_markup: mp.adsInlineButton(ad),
							});
						}
					} else {
						this.bot.sendMessage(chatId, 'No ads channels!');
					}
				} else if (text === '/turnOff') {
					await adsService.update([]);
					this.bot.sendMessage(chatId, 'Ads turned off successfully');
				}
			} else {
				return await this.bot.sendMessage(chatId, ms.notAdmin);
			}
		});
	}

	private async adsCreate() {
		this.bot.once('message', async (msg) => {
			const chatId = msg.chat.id;
			const username = msg.text?.trim().split('@')[1];
			const { success } = await adminService.isAdmin(chatId);

			if (success && username) {
				try {
					const isChannel = await this.bot.getChat(username);
					console.log({ isChannel });

					await adsService.create(username);
					await bot
						.sendMessage(chatId, 'New ads created successfully')
						.then(() => this.adsOptions(chatId));
				} catch (error: any) {
					await this.bot
						.sendMessage(chatId, `🚫 Error: Username @${username} not found`)
						.then(() => this.adsCreate());
					console.log({ error });
				}
			}
		});
	}

	async deleteAd() {
		this.bot.on('callback_query', async (msg) => {
			const data = msg.data;
			const chatId = msg.message?.chat.id;
			if (data && chatId) {
				try {
					if (data && data.startsWith('delete_ads_')) {
						const username = data.split('delete_ads_')[1];
						const existAd = await adsService.getOne();
						const channels = existAd?.channels.filter((c) => c !== username);
						console.log({ channels, username, existAd });

						const updateAd = await adsService.update(channels);

						if (updateAd) {
							this.bot.deleteMessage(chatId, msg.message?.message_id!);
							this.bot.sendMessage(chatId, 'Ads removed successfully');
						}
					}
				} catch (error: any) {
					this.bot.sendMessage(chatId, `Error: ${error?.message}`, {
						parse_mode: 'Markdown',
					});
				}
			}
		});
	}

	private async adsOptions(chatId: number) {
		await this.bot.sendMessage(chatId, ms.ads.homeMsg, {
			parse_mode: 'Markdown',
			reply_markup: mp.adsMenu,
		});
	}

	init() {
		this.subscribe();
		this.deleteAd();
	}
}

export default new AdsModule(bot);
