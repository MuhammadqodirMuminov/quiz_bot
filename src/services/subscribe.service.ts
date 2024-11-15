import { Model, Types } from 'mongoose';
import { adsSchema, ISubscribe } from '../models/subscribe.schema';

class SubscribeService {
	protected SubscribeModel: Model<ISubscribe>;

	constructor(SubscribeModel: Model<ISubscribe>) {
		this.SubscribeModel = SubscribeModel;
	}

	async getOne() {
		try {
			const subscribe = await this.SubscribeModel.find();
			if (!subscribe.length) {
				const newAd = await this.SubscribeModel.create({
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
			return await this.SubscribeModel.findByIdAndUpdate(
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
}

export default new SubscribeService(adsSchema);
