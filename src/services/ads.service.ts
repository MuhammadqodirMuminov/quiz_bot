import TelegramBot from 'node-telegram-bot-api';
import { bot } from '../config/bot.config';
import { IAdsData } from '../types';

class AdsService {
	private bot: TelegramBot;
	private _adsStatus: boolean = false;

	private _ads: IAdsData = {};

	constructor(bot: TelegramBot) {
		this.bot = bot;
	}

	get adsStatus(): boolean {
		return this._adsStatus;
	}

	set adsStatus(status: boolean) {
		this._adsStatus = status;
	}

	get ads(): IAdsData {
		return this._ads;
	}

	set ads(ads: Partial<IAdsData>) {
		this._ads = { ...this._ads, ...ads };
	}
}

export default new AdsService(bot);
