import mongoose, { Document, model, Schema, SchemaTypes, Types } from 'mongoose';
import { FileTypes } from '../types';

export interface IFile extends Document {
	_id: Types.ObjectId;
	fileType: FileTypes;
	fileId: string;
}

export const FileDocument = new Schema<IFile>(
	{
		_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
		fileType: { type: SchemaTypes.String, enum: FileTypes, required: true, default: FileTypes.IMAGE },
		fileId: { type: String, required: true },
	},
	{ versionKey: false }
);

export const fileSchema = model<IFile>('files', FileDocument);
