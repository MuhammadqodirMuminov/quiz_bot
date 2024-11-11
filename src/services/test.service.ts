import { FilterQuery, Model, Types } from 'mongoose';
import { ITest, testSchema } from '../models/test.model';

export class TestService {
	protected testModel: Model<ITest>;

	constructor(testModel: Model<ITest>) {
		this.testModel = testModel;
	}

	async createTest(testDto: Partial<ITest>): Promise<ITest> {
		try {
			const newTest = await this.testModel.create({
				...testDto,
				_id: new Types.ObjectId(),
			});

			return newTest;
		} catch (error) {
			console.log(error);

			throw new Error('Error at Tests Check your Details :)');
		}
	}

	async getAll(): Promise<ITest[]> {
		return await this.testModel.find({ isPublished: true }, {}, { populate: ['image'] });
	}

	async getOne(filterQuery: FilterQuery<ITest>): Promise<ITest | null> {
		const test = await this.testModel.findOne(filterQuery, {}, { populate: ['image'] });
		return test;
	}

	async update(_id: string, testDto: Partial<ITest>): Promise<Boolean> {
		const test = await this.getOne({ _id });

		if (!test) {
			throw new Error('Test not found');
		}

		Object.assign(test, testDto);

		try {
			const updatedTest = await this.testModel.findByIdAndUpdate(_id, test, { new: true });

			if (!updatedTest) {
				throw new Error('Failed to update test');
			}

			return true;
		} catch (error: any) {
			throw new Error(`Error updating test: ${error.message}`);
		}
	}
}

export default new TestService(testSchema);
