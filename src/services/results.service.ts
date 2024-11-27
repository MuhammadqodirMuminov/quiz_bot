import mongoose, { FilterQuery, Model, Types } from 'mongoose';
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
		const result = await this.resultModel.findOne(
			filerQuery,
			{},
			{ populate: ['user', 'test'] }
		);

		return result;
	}

	async getAll(filerQuery: FilterQuery<IResult>) {
		const results = await this.resultModel
			.find(
				filerQuery,
				{},
				{
					populate: ['user', 'test'],
				}
			)
			.lean(true);
		return results as IResult[];
	}

	async getResults(testId: string) {
		const results = await this.resultModel.aggregate([
			{
				$match: {
					test: new Types.ObjectId(testId),
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'user',
					foreignField: '_id',
					as: 'user',
				},
			},
			{
				$unwind: '$user',
			},
			{
				$lookup: {
					from: 'tests',
					localField: 'test',
					foreignField: '_id',
					as: 'test',
				},
			},
			{
				$unwind: '$test',
			},
			{
				$addFields: {
					maxScore: { $max : '$atteps.score' },
				},
			},
			{
				$project: {
					_id: 1,
					user: 1,
					test: 1,
					atteps: {
						$filter: {
							input: '$atteps',
							as: 'attep',
							cond: { $eq: ['$$attep.score', '$maxScore'] },
						},
					},
				},
			},
		]);

		return results;
	}

	async update(filerQuery: FilterQuery<IResult>, update: { score: number }) {
		const updateResult = await this.resultModel.findOneAndUpdate(
			filerQuery,
			{ $push: { atteps: update } },
			{ new: true, populate: ['user', 'test'] }
		);
		return updateResult;
	}
}

export default new ResultService(resultSchema);
