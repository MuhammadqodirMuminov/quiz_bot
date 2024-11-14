import { FilterQuery, Model, Types } from 'mongoose';
import { adsSchema, IAds } from '../models/ads.schema';

class AdsService {
	protected adsModel: Model<IAds>;

	constructor(adsModel: Model<IAds>) {
		this.adsModel = adsModel;
	}

	async getOne() {
		try {
			const ads = await this.adsModel.find();
			if (!ads.length) {
				const newAd = await this.adsModel.create({
					isActive: true,
					channels: [],
					_id: new Types.ObjectId(),
				});
				return await newAd.save();
			}
			return ads[0];
		} catch (error) {
			throw new Error('Ads get error');
		}
	}

	async create(username: string) {
		try {
			const existAd = await this.getOne();
			const channels = [...existAd.channels, username];
			return await this.update(channels);
		} catch (error) {
			throw new Error('Ads create error');
		}
	}

	async update(channels: string[]) {
		try {
			const existAd = await this.getOne();
			return await this.adsModel.findByIdAndUpdate(
				existAd.id,
				{ channels },
				{
					new: true,
				}
			);
		} catch (error) {
			throw new Error('Error updating ads');
		}
	}
}

export default new AdsService(adsSchema);
