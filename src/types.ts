export interface IResponse<T = null> {
	message?: string;
	data?: T;
	success?: boolean;
}

export enum FileTypes {
	IMAGE = 'IMAGE',
	VIDEO = 'VIDEO',
	DOCUMENT = 'DOCUMENT',
    AUDIO = 'AUDIO',
}