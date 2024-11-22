import mongoose, { model, Schema } from 'mongoose';

export interface ISubscribe {
	_id: mongoose.Schema.Types.ObjectId;
	isActive?: Boolean;
	channels: string[];
}

export const SubscribeDocument = new Schema<ISubscribe>({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true },
	isActive: { type: Boolean, required: false },
	channels: { type: [String], required: true, default: [] },
});

export const adsSchema = model<ISubscribe>('subscribe', SubscribeDocument);
