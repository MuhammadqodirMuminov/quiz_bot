import { FilterQuery, Model, Types } from 'mongoose';
import { IAdsData } from '../types';
import { adsSchema, IAds } from '../models/ads.schema';

class AdsService {
	protected adsModel: Model<IAds>;
	private _adsStatus: boolean = false;

	private _ads: IAdsData = {};

	constructor(adsModel: Model<IAds>) {
		this.adsModel = adsModel;
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

	async create(ad: Partial<IAds>) {
		const existAd = await this.adsModel.findOne({ shortName: ad.shortName });
		if (!existAd) {
			try {
				return (
					await this.adsModel.create({ ...ad, _id: new Types.ObjectId() })
				).save();
			} catch (error) {
				throw new Error('Error creating ads');
			}
		}
	}

	async getAll(filterQuery: FilterQuery<IAds>) {
		return await this.adsModel.find(filterQuery).populate(['file']);
	}

	async getOne(filterQuery: FilterQuery<IAds>) {
		const existAd = await this.adsModel.findOne(filterQuery);
		if (!existAd) {
			throw new Error('Ad not found');
		}

		return existAd;
	}

	async update(id: string, ads: Partial<IAds>) {
		try {
			return await this.adsModel.findByIdAndUpdate(id, ads, { new: true });
		} catch (error) {
			throw new Error('Error updating ads');
		}
	}

	async deleteAd(id: string) {
		const existAd = await this.adsModel.findById(id);
		try {
			if (!existAd) {
				throw new Error('Ad not found');
			}

			await this.adsModel.deleteOne({ _id: id });
		} catch (error) {
			throw new Error('Error deleting ads');
		}
	}
}

export default new AdsService(adsSchema);
