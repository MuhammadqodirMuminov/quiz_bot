import TelegramBot from 'node-telegram-bot-api';
import { bot } from '../config/bot.config';
import { ms } from '../constants';
import adminService from '../services/admin.service';
import adsService from '../services/ads.service';
import { mp } from '../utils';
import fileService from '../services/file.service';
import { FileTypes } from '../types';
import { IFile } from '../models/file.schema';
import { IAds } from '../models/ads.schema';

class AdsModule {
	private bot: TelegramBot;
	constructor(bot: TelegramBot) {
		this.bot = bot;
	}

	private turnOnAds() {
		this.bot.onText(/\/turn_on_ads/, async (msg) => {
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
						}
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
		this.bot.onText(/\/turn_off_ads/, async (msg) => {
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
						}
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
		this.bot.onText(/\/new_ad/, async (msg) => {
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
		this.bot.once('message', async (msg) => {
			const chatId = msg.chat.id;
			const text = msg.text;

			const { success } = await adminService.isAdmin(chatId);

			if (success) {
				adsService.ads.shortName = text?.trim();
				this.bot
					.sendMessage(
						chatId,
						ms.adsData({ shortName: adsService.ads.shortName }),
						{ reply_markup: { remove_keyboard: true } }
					)
					.then(() => {
						this.handleText();
					});
			}
		});
	}

	private handleText() {
		this.bot.once('message', async (msg) => {
			const chatId = msg.chat.id;
			const text = msg.text;

			const { success } = await adminService.isAdmin(chatId);

			if (success) {
				adsService.ads.text = text;
				this.bot
					.sendMessage(
						chatId,
						ms.adsText({ shortName: adsService.ads.shortName }),
						{
							reply_markup: { remove_keyboard: true },
						}
					)
					.then(() => {
						this.handleButtonText();
					});
			}
		});
	}

	private handleButtonText() {
		this.bot.once('message', async (msg) => {
			const chatId = msg.chat.id;
			const text = msg.text;

			const { success } = await adminService.isAdmin(chatId);

			if (success) {
				if (text === '0') {
					adsService.ads.btnText = '';
					await this.bot
						.sendMessage(chatId, ms.adsBtnText, {
							parse_mode: 'Markdown',
							reply_markup: mp.offMarkup,
						})
						.then(() => this.handleMedia());
				} else {
					adsService.ads.btnText = msg.text;
					await this.bot
						.sendMessage(chatId, ms.adsBtnText2, {
							parse_mode: 'Markdown',
							reply_markup: mp.offMarkup,
						})
						.then(() => this.handleButtonUrl());
				}
			} else {
				return await this.bot.sendMessage(chatId, ms.notAdmin, {
					parse_mode: 'Markdown',
				});
			}
		});
	}

	private handleButtonUrl() {
		this.bot.once('message', async (msg) => {
			const chatId = msg.chat.id;
			const text = msg.text;

			const { success } = await adminService.isAdmin(chatId);
			if (success) {
				adsService.ads.btnUrl = text;
				await this.bot
					.sendMessage(chatId, ms.adsBtnText, {
						parse_mode: 'Markdown',
					})
					.then(() => this.handleMedia());
			} else {
				return await this.bot.sendMessage(chatId, ms.notAdmin, {
					parse_mode: 'Markdown',
				});
			}
		});
	}

	private handleMedia() {
		this.bot.once('message', async (msg) => {
			const text = msg.text;
			const chatId = msg.chat.id;
			const { success } = await adminService.isAdmin(chatId);

			if (success) {
				const btnText = adsService.ads.btnText;

				if (text === '1') {
					await this.bot
						.sendMessage(chatId, ms.adsMedia, {
							parse_mode: 'Markdown',
							reply_markup: mp.offMarkup,
						})
						.then(() => this.handleFile());
				} else if (text === '0') {
					if (btnText === '') {
						adsService.ads.btnText = '';

						this.bot.sendMessage(chatId, adsService.ads.text as string, {
							parse_mode: 'Markdown',
							reply_markup: mp.offMarkup,
						});
					} else {
						const { shortName, text, btnText, btnUrl } = adsService.ads;

						await this.bot.sendMessage(
							chatId,
							ms.adsMediaText2(shortName!, text!),
							{
								parse_mode: 'Markdown',
								reply_markup: mp.adsMedia(btnText!, btnUrl!),
							}
						);
						await this.bot.sendMessage(chatId, 'Confirm ad ?', {
							parse_mode: 'Markdown',
							reply_markup: mp.confirmAd,
						});
					}
				} else {
					await this.bot.sendMessage(chatId, ms.adsMediaText);
					// .then(() => this.handleMedia());
				}
			} else {
				return await this.bot.sendMessage(chatId, ms.notAdmin, {
					parse_mode: 'Markdown',
				});
			}
		});
	}

	confirmAd() {
		this.bot.onText(/\/confirm/, async (msg) => {
			const chatId = msg.chat.id;

			const { success } = await adminService.isAdmin(chatId);
			if (success) {
				const { file, mediaType } = adsService.ads;
				const newFile = file
					? await fileService.createFile({
							fileId: file,
							fileType: mediaType,
					  })
					: undefined;

				const newAd = await adsService.create({
					...adsService.ads,
					file: newFile,
				});

				await this.bot.sendMessage(chatId, ms.adsCreate);
				await this.adsOptions(chatId);
				adsService.ads = {};
			} else {
				return await this.bot.sendMessage(chatId, ms.notAdmin, {
					parse_mode: 'Markdown',
				});
			}
		});
	}

	declineAd() {
		this.bot.onText(/\/decline/, async (msg) => {
			adsService.ads = {};
			return await this.adsOptions(msg.chat.id);
		});
	}

	private handleFile() {
		this.bot.once('message', async (msg) => {
			const fileId = msg.photo?.at(-1)?.file_id;
			const videoId = msg.video?.file_id;
			const documentFileId = msg.document?.file_id;

			if (fileId) {
				adsService.ads.mediaType = FileTypes.IMAGE;
				adsService.ads.file = fileId;
			} else if (documentFileId) {
				adsService.ads.mediaType = FileTypes.DOCUMENT;
				adsService.ads.file = documentFileId;
			} else if (fileId) {
				adsService.ads.mediaType = FileTypes.VIDEO;
				adsService.ads.file = videoId;
			}
			const { shortName, text, btnText, btnUrl } = adsService.ads;
			await this.bot.sendPhoto(msg.chat.id, fileId!, {
				parse_mode: 'Markdown',
				caption: ms.adsMediaText2(shortName!, text!),
				reply_markup: mp.adsMedia(btnText!, btnUrl!),
			});

			await this.bot.sendMessage(msg.chat.id, 'Confirm ad ?', {
				parse_mode: 'Markdown',
				reply_markup: mp.confirmAd,
			});
		});
	}

	private listAd() {
		this.bot.onText(/\/list_ad/, async (msg) => {
			const chatId = msg.chat.id;
			const { success } = await adminService.isAdmin(chatId);
			if (success) {
				const ads = await adsService.getAll({});

				if (ads.length) {
					const markup = (ad: IAds) => mp.adsMedia(ad.btnText!, ad.btnUrl!);
					const markdown = (ad: IAds) => `${ad.shortName}\n\n${ad.text}`;
					for (const ad of ads) {
						if (ad.mediaType === FileTypes.IMAGE) {
							await this.bot.sendPhoto(chatId, ad.file.fileId, {
								caption: markdown(ad),
								parse_mode: 'Markdown',
								reply_markup: markup(ad),
							});
						} else if (ad.mediaType === FileTypes.VIDEO) {
							await this.bot.sendVideo(chatId, ad.file.fileId, {
								caption: markdown(ad),
								reply_markup: markup(ad),
								parse_mode: 'Markdown',
							});
						} else if (ad.mediaType === FileTypes.DOCUMENT) {
							await this.bot.sendDocument(chatId, ad.file.fileId, {
								caption: markdown(ad),
								reply_markup: markup(ad),
								parse_mode: 'Markdown',
							});
						}
						await this.bot.sendMessage(chatId, markdown(ad), {
							reply_markup: markup(ad),
							parse_mode: 'Markdown',
						});
					}
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
		this.turnOnAds();
		this.turnOfAds();
		this.newAds();
		this.confirmAd();
		this.declineAd();
		this.listAd();
	}
}

export default new AdsModule(bot);
