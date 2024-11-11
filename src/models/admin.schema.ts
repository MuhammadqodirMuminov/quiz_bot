import mongoose, { model, Schema } from 'mongoose';

export interface IAdmin {
	_id: mongoose.Schema.Types.ObjectId;
	chat_id: number;
	username?: string;
}

export const AdminDocument = new Schema<IAdmin>({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true },
	chat_id: { type: Number, required: false },
	username: { type: String, required: false },
});

export const adminSchema = model<IAdmin>('admins', AdminDocument);
