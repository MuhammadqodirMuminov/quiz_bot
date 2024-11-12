import { FilterQuery, Model } from 'mongoose';
import { IResult, resultSchema } from '../models/result.schema';

class ResultService {
	protected resultModel: Model<IResult>;

	constructor(resultModel: Model<IResult>) {
		this.resultModel = resultModel;
	}

	async create(resultDto: Partial<IResult>) {
		try {
			const newResult = new this.resultModel(resultDto);
			return await newResult.save();
		} catch (error) {
			throw new Error('Error creating result!');
		}
	}

	async getOne(filerQuery: FilterQuery<IResult>) {
		const result = await this.resultModel.findOne(filerQuery, {}, { populate: ['user', 'test'] });

		return result;
	}

	async update(filerQuery: FilterQuery<IResult>, update: { score: number }) {
		const updateResult = await this.resultModel.findOneAndUpdate(filerQuery, { $push: { atteps: update } }, { new: true, populate: ['user', 'test'] });
		return updateResult;
	}
}

export default new ResultService(resultSchema);
