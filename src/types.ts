export interface IResponse<T = null> {
	message?: string;
	data?: T;
	success?: boolean;
}
