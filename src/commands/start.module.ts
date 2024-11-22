import TelegramBot from 'node-telegram-bot-api';
import { bot } from '../config/bot.config';
import { ms } from '../constants';
import subscribeService from '../services/subscribe.service';
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
			let isMember: boolean | null = null;

			const channel = await subscribeService.getOne();

			if (channel) {
				for (let i = 0; i < channel.channels.length; i++) {
					const c = channel.channels[i];

					const result = await this.bot.getChatMember(`@${c}`, chatId);

					if (
						result.status == 'administrator' ||
						result.status == 'creator' ||
						result.status == 'member'
					) {
						isMember = true;
					} else {
						await this.bot.sendMessage(
							chatId,
							ms.joinMessage(channel.channels),
							{
								reply_markup: mp.channelBtns(channel.channels),
								parse_mode: 'HTML',
							},
						);
						return;
					}
				}
			}

			await userService.create({
				chat_id: chatId,
				username: msg.chat.username,
				date_of_join: new Date(),
			});

			await this.bot.sendMessage(chatId, ms.helloMessage, {
				reply_markup: mp.userMenu,
				parse_mode: 'Markdown',
			});
		});
	}

	setCommands() {
		this.bot.setMyCommands([
			{ command: '/start', description: 'Start the bot' },
			{ command: '/admin', description: 'Admins approved' },
			{ command: '/help', description: 'Bot helps and sitemaps' },
		]);
	}

	async callbackQuery() {
		this.bot.on('callback_query', async msg => {
			let isMember: boolean | null = null;
			const chatId = msg.message?.chat.id;
			const data = msg.data;
			if (data && data === 'user_joined') {
				const channel = await subscribeService.getOne();

				if (channel) {
					for (let i = 0; i < channel.channels.length; i++) {
						const c = channel.channels[i];

						const result = await this.bot.getChatMember(`@${c}`, chatId!);

						if (
							result.status == 'administrator' ||
							result.status == 'creator' ||
							result.status == 'member'
						) {
							isMember = true;
						} else {
							await this.bot.sendMessage(
								chatId!,
								ms.joinMessage(channel.channels),
								{
									reply_markup: mp.channelBtns(
										channel.channels,
									),
									parse_mode: 'HTML',
								},
							);
							return;
						}
					}
				}

				await userService.create({
					chat_id: chatId,
					username: msg.message?.chat.username,
					date_of_join: new Date(),
				});

				await this.bot.sendMessage(chatId!, ms.helloMessage, {
					reply_markup: mp.userMenu,
					parse_mode: 'Markdown',
				});

				if (isMember) {
					await this.bot.answerCallbackQuery(msg.id, {
						text: '✅ Aʼzo ekanligingiz tasdiqlandi! Davom etishingiz mumkin.',
						show_alert: true,
					});
				}
			}
		});
	}

	init() {
		this.callbackQuery();
		this.start();
		this.setCommands();
	}
}

export default new StartModule(bot);
