import { FilterQuery, Model, Types } from 'mongoose';
import { IUser, userSchema } from '../models/user.schema';

class UserService {
	protected userModel: Model<IUser>;

	constructor(userModel: Model<IUser>) {
		this.userModel = userModel;
	}

	async getOne(filterQuery: FilterQuery<IUser>): Promise<IUser> {
		const user = await this.userModel.findOne(filterQuery);

		if (!user) {
			throw new Error('User not found');
		}
		return user;
	}

	async getAll(filterQuery: FilterQuery<IUser>): Promise<IUser[]> {
		return await this.userModel.find(filterQuery);
	}

	async create(user: Partial<IUser>): Promise<IUser> {
		const existUser = await this.userModel.findOne({ chat_id: user.chat_id });
		if (!existUser) {
			try {
				return (
					await this.userModel.create({ ...user, _id: new Types.ObjectId() })
				).save();
			} catch (error) {
				throw new Error('Error creating user');
			}
		}
		return existUser;
	}
}

export default new UserService(userSchema);
