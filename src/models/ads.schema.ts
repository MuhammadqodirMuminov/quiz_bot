import mongoose, { model, Schema } from 'mongoose';

export interface IAds {
	_id: mongoose.Schema.Types.ObjectId;
	isActive?: Boolean;
	channels: string[];
}

export const AdsDocument = new Schema<IAds>({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true },
	isActive: { type: Boolean, required: false },
	channels: { type: [String], required: true, default: [] },
});

export const adsSchema = model<IAds>('ads', AdsDocument);
