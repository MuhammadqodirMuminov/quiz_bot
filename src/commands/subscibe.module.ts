import TelegramBot from 'node-telegram-bot-api';
import { bot } from '../config/bot.config';
import { ms } from '../constants';
import adminService from '../services/admin.service';
import subscribeService from '../services/subscribe.service';
import { mp } from '../utils';
import adminModule from './admin.module';

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
						this.subscribeManage();
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

	private async subscribeManage() {
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
						.then(() => this.subscribeCreate());
				} else if (text === '/getAll') {
					const ads = await subscribeService.getOne();

					if (ads?.channels.length) {
						for (const ad of ads?.channels) {
							this.bot
								.sendMessage(chatId, `Channel: @${ad}`, {
									parse_mode: 'HTML',
									reply_markup: mp.subscribeInlineButton(ad),
								})
								.then(() =>
									adminModule.admin_options(chatId, msg.from?.username || '')
								);
						}
					} else {
						this.bot
							.sendMessage(chatId, 'No subscribe channels!')
							.then(() =>
								adminModule.admin_options(chatId, msg.from?.username || '')
							);
					}
				} else if (text === '/turnOff') {
					await subscribeService.update([]);
					this.bot.sendMessage(chatId, 'Subscribe turned off successfully');
				}
			} else {
				return await this.bot.sendMessage(chatId, ms.notAdmin);
			}
		});
	}

	private async subscribeCreate() {
		this.bot.once('message', async (msg) => {
			const chatId = msg.chat.id;
			const username = msg.text?.trim().split('@')[1];
			const { success } = await adminService.isAdmin(chatId);

			if (success && username) {
				try {
					await this.bot.getChat(`@${username}`);

					await subscribeService.create(username);
					await bot
						.sendMessage(chatId, 'New ads created successfully')
						.then(() =>
							adminModule.admin_options(chatId, msg.from?.username || '')
						);
				} catch (error: any) {
					await this.bot
						.sendMessage(chatId, `🚫 Error: Username @${username} not found`)
						.then(() =>
							adminModule.admin_options(chatId, msg.from?.username || '')
						);
				}
			}
		});
	}

	async deleteSubscribe() {
		this.bot.on('callback_query', async (msg) => {
			const data = msg.data;
			const chatId = msg.message?.chat.id;
			if (data && chatId) {
				try {
					if (data && data.startsWith('delete_ads_')) {
						const username = data.split('delete_ads_')[1];
						const existAd = await subscribeService.getOne();
						const channels = existAd?.channels.filter((c) => c !== username);

						const updateAd = await subscribeService.update(channels);

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
			reply_markup: mp.subscribeMenu,
		});
	}

	init() {
		this.subscribe();
		this.deleteSubscribe();
	}
}

export default new AdsModule(bot);
