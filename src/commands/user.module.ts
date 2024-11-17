import TelegramBot from 'node-telegram-bot-api';
import { bot } from '../config/bot.config';
import { ms } from '../constants';
import { testResult } from '../constants/messages';
import resultsService from '../services/results.service';
import testService from '../services/test.service';
import userService from '../services/user.service';
import { FileTypes } from '../types';
import { countMatchingAnswers, extractNumberAndString, mp } from '../utils';

class UserModule {
	private bot: TelegramBot;

	constructor(bot: TelegramBot) {
		this.bot = bot;
	}

	checkAnswers() {
		this.bot.onText(/\/checkAnswers/, async msg => {
			const chatId = msg.chat.id;
			bot.sendMessage(chatId, ms.checkAnswers, {
				reply_markup: { remove_keyboard: true },
			}).then(() => {
				this.handleResult();
			});
		});
	}

	userStat() {
		this.bot.onText(/\/userStat/, async msg => {
			const chatId = msg.chat.id;
			try {
				const user = await userService.getOne({ chat_id: chatId });
				const results = await resultsService.getAll({ user: user });

				return await this.bot.sendMessage(chatId, ms.userStats(results), {
					reply_markup: mp.userMenu,
					parse_mode: 'Markdown',
				});
			} catch (error: any) {
				await this.bot.sendMessage(chatId, error.message);
			}
		});
	}

	private handleResult() {
		this.bot.once('message', async msg => {
			const chatId = msg.chat.id;
			const answers = msg.text;

			const results = extractNumberAndString(answers!);

			if (results) {
				const test = await testService.getOne({ code: results.number });

				if (!test) {
					await bot.sendMessage(chatId, ms.test.notFound, {
						reply_markup: mp.userMenu,
					});
					return;
				}

				if (test && test.isPublished === false) {
					await bot.sendMessage(chatId, ms.test.notFound, {
						reply_markup: mp.userMenu,
					});
					return;
				}

				if (results.pattern.length !== test.count) {
					await bot.sendMessage(chatId, ms.test.wrongCount, {
						reply_markup: mp.userMenu,
					});
					return;
				}

				const user = await userService.getOne({ chat_id: chatId });

				const checkedAnswers = countMatchingAnswers(results.pattern, test.answers);

				const existresult = await resultsService.getOne({ user: user, test });

				if (existresult) {
					await resultsService.update(
						{ user: user, test: test },
						{
							score: checkedAnswers.correctMatches,
						},
					);
				} else {
					await resultsService.create({
						user: user,
						test: test,
						atteps: [
							{
								score: checkedAnswers.correctMatches,
							},
						],
					});
				}
				await this.bot.sendMessage(
					chatId,
					testResult(
						test.name,
						checkedAnswers.correctMatches,
						checkedAnswers.wrongAnswers.length,
						checkedAnswers.wrongAnswers,
					),
					{
						reply_markup: mp.userMenu,
						parse_mode: 'Markdown',
					},
				);
			} else {
				await bot.sendMessage(chatId, ms.checkAnswers, {
					reply_markup: mp.userMenu,
				});
				return;
			}
		});
	}

	async sendAllUser(adminChatId: number, text: string, media: string, mediaType: string) {
		const users = await userService.getAll({});
		let sended = 0;
		let unSended = 0;

		for (const user of users) {
			try {
				if (media) {
					if (mediaType === 'mp4') {
						await this.bot.sendVideo(user.chat_id, media, {
							caption: text,
							reply_markup: mp.offMarkup,
							parse_mode: 'Markdown',
						});
					} else if (mediaType === FileTypes.DOCUMENT) {
						await this.bot.sendDocument(user.chat_id, media, {
							caption: text,
							reply_markup: mp.offMarkup,
						});
					} else {
						await this.bot.sendPhoto(user.chat_id, media, {
							caption: text,
							reply_markup: mp.offMarkup,
							parse_mode: 'Markdown',
						});
					}
				} else {
					await this.bot.sendMessage(user.chat_id, text, {
						parse_mode: 'Markdown',
					});
				}

				sended += 1;
			} catch (error) {
				unSended += 1;
			}
		}

		await this.bot.sendMessage(adminChatId, `Sent ${sended} \nNot Sent ${unSended}`, {
			parse_mode: 'Markdown',
			reply_markup: mp.adminMenu,
		});
	}

	init() {
		this.checkAnswers();
		this.userStat();
	}
}

export default new UserModule(bot);
