import { FilterQuery, Model, Types } from 'mongoose';
import { IAdmin, adminSchema } from '../models/admin.schema';
import { IResponse } from '../types';

class AdminService {
	protected adminModel: Model<IAdmin>;

	constructor(adminModel: Model<IAdmin>) {
		this.adminModel = adminModel;
	}

	async getOne(filterQuery: FilterQuery<IAdmin>): Promise<IAdmin> {
		const admin = await this.adminModel.findOne(filterQuery);

		if (!admin) {
			throw new Error('Admin not found');
		}
		return admin;
	}

	async create(user: Partial<IAdmin>): Promise<IResponse<IAdmin>> {
		const existUser = await this.adminModel.findOne({ chat_id: user.chat_id });
		if (!existUser) {
			try {
				const newAdmin = await this.adminModel.create({
					...user,
					_id: new Types.ObjectId(),
				});
				await newAdmin.save();
				return { data: newAdmin };
			} catch (error: any) {
				return { message: 'Error create user' };
			}
		}
		return { data: existUser };
	}

	async deleteAdmin(chat_id: number): Promise<IResponse<IAdmin>> {
		const admin = await this.adminModel.findOne({ chat_id: chat_id });

		try {
			if (admin) {
				await this.adminModel.deleteOne({ chat_id });
				return { message: `${admin.username} admin is deleted` };
			} else {
				return { message: 'admin is already deleted' };
			}
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	async isAdmin(chat_id: number): Promise<IResponse> {
		const admin = await this.adminModel.findOne({ chat_id });

		if (admin) {
			return { success: true };
		}
		return { success: false };
	}

	async getAllAdmins(filterQuery: FilterQuery<IAdmin>): Promise<IAdmin[]> {
		const admins = await this.adminModel.find(filterQuery);
		return admins;
	}
}

export default new AdminService(adminSchema);
