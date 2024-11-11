import mongoose, { Document, model, Schema } from 'mongoose';
import { getNextSequenceValue } from './counter.schema';
import { IFile } from './file.schema';

export interface ITest extends Document {
	_id: mongoose.Schema.Types.ObjectId;
	name: string;
	code: number;
	answers: string;
	count: number;
	image: IFile;
	expiredTime: Date;
	text: string;
	isPublished: boolean;
}

const TestDocument = new Schema<ITest>(
	{
		_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
		name: { type: String, required: true },
		code: { type: Number, unique: true },
		answers: { type: String },
		count: { type: Number },
		image: { type: mongoose.Schema.Types.ObjectId, ref: 'files', required: false },
		expiredTime: { type: Date },
		text: { type: String },
		isPublished: { type: Boolean, required: false, default: false },
	},
	{ versionKey: false, timestamps: true }
);

TestDocument.pre<ITest>('save', async function (next) {
	if (this.isNew) {
		try {
			this.code = await getNextSequenceValue('test_code');
			('test_code');
			next();
		} catch (error: any) {
			next(error);
		}
	} else {
		next();
	}
});

export const testSchema = model<ITest>('tests', TestDocument);
