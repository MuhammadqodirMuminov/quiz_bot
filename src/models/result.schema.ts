import mongoose, { Document, Schema } from 'mongoose';
import { ITest } from './test.model';
import { IUser } from './user.schema';
const AutoIncrementFactory = require('mongoose-sequence')(mongoose);

const AttepSchema = new Schema(
	{
		score: { type: Number, required: true },
	},
	{ versionKey: false, _id: false }
);

const ResultSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
	test: { type: Schema.Types.ObjectId, ref: 'tests', required: true },
	atteps: [AttepSchema],
});

export interface IResult extends Document {
	user: IUser;
	test: ITest;
	atteps: { score: number }[];
}

export const resultSchema = mongoose.model<IResult>('results', ResultSchema);
