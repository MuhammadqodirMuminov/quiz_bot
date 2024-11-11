import mongoose, { model, Schema, Types } from 'mongoose';

export interface IUser extends Document {
	_id: mongoose.Schema.Types.ObjectId;
	chat_id: number;
	username: string;
	date_of_join: Date;
}

export const UserDocument = new Schema<IUser>({
	_id: { type: Types.ObjectId, required: true },
	chat_id: { type: Number, required: false },
	username: { type: String, required: false },
	date_of_join: { type: Date, required: false },
});

export const userSchema =
	mongoose.models.users || model<IUser>('users', UserDocument);
