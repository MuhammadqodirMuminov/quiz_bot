import mongoose, { model, Schema } from 'mongoose';
import { IFile } from './file.schema';

export interface IAds {
	_id: mongoose.Schema.Types.ObjectId;
	shortName: string;
	text: string;
	file: IFile;
	mediaType?: string;
	btnText?: string;
	btnUrl?: string;
}

export const AdsDocument = new Schema<IAds>({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true },
	shortName: { type: String, required: true },
	text: { type: String, required: true },
	file: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'files' },
	mediaType: { type: String, required: false },
	btnText: { type: String, required: true },
	btnUrl: { type: String, required: true },
});

export const adsSchema = model<IAds>('ads', AdsDocument);
