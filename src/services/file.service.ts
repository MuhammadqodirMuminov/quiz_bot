import { Model, Types } from 'mongoose';
import { fileSchema, IFile } from '../models/file.schema';

class FileService {
	protected fileModel: Model<IFile>;

	constructor(fileModel: Model<IFile>) {
		this.fileModel = fileModel;
	}

	async createFile(fileDto: Partial<IFile>): Promise<IFile> {
		try {
			const newFile = await this.fileModel.create({ ...fileDto, _id: new Types.ObjectId() });
			return newFile;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}
}

export default new FileService(fileSchema);
