import { Model, Types } from 'mongoose';
import { ISubscribe, subscribeSchema } from '../models/subscribe.schema';

class SubscribeService {
	protected subscribeModel: Model<ISubscribe>;

	constructor(subscribeModel: Model<ISubscribe>) {
		this.subscribeModel = subscribeModel;
	}

	async getOne() {
		try {
			const subscribe = await this.subscribeModel.find();
			if (!subscribe.length) {
				const newAd = await this.subscribeModel.create({
					isActive: true,
					channels: [],
					_id: new Types.ObjectId(),
				});
				return await newAd.save();
			}
			return subscribe[0];
		} catch (error) {
			throw new Error('Subscribe get error');
		}
	}

	async create(username: string) {
		try {
			const existSubscribe = await this.getOne();
			const channels = [...existSubscribe.channels, username];
			return await this.update(channels);
		} catch (error) {
			throw new Error('Subscribe create error');
		}
	}

	async update(channels: string[]) {
		try {
			const existSubscribe = await this.getOne();
			return await this.subscribeModel.findByIdAndUpdate(
				existSubscribe.id,
				{ channels },
				{
					new: true,
				}
			);
		} catch (error) {
			throw new Error('Error updating subscribe');
		}
	}

	async updateIsActive(isActive: boolean) {
		try {
			const existSubscribe = await this.getOne();
			return await this.subscribeModel.findByIdAndUpdate(
				existSubscribe.id,
				{ isActive },
				{ new: true }
			);
		} catch (error) {
			throw new Error('Error update is active subscribe');
		}
	}

	async updateAdStatus(adStatus: boolean) {
		try {
			const existSubscribe = await this.getOne();
			return await this.subscribeModel.findByIdAndUpdate(
				existSubscribe.id,
				{ adStatus },
				{ new: true }
			);
		} catch (error) {
			throw new Error('Error update ad status');
		}
	}
}

export default new SubscribeService(subscribeSchema);
