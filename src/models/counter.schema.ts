import mongoose, { Schema, Document } from 'mongoose';

interface ICounter extends Document {
	_id: string;
	sequence_value: number;
}

const CounterSchema = new Schema<ICounter>({
	_id: { type: String, required: true },
	sequence_value: { type: Number, required: true },
});

const Counter = mongoose.model<ICounter>('Counter', CounterSchema);


export async function getNextSequenceValue(sequenceName: string): Promise<number> {
	const counter = await Counter.findOneAndUpdate({ _id: sequenceName }, { $inc: { sequence_value: 1 } }, { new: true, upsert: true });

	if (!counter) {
		throw new Error('Counter not initialized');
	}

	return counter.sequence_value;
}
