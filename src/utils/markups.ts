export const adminMenu = {
	keyboard: [[{ text: '/stat' }], [{ text: '/test' }, { text: '/mail_users' }], [{ text: '/subscription' }, { text: '/ads' }]],
	resize_keyboard: true,
	one_time_keyboard: false,
};

export const testMenu = {
	keyboard: [[{ text: '/create' }, { text: '/getAll' }], [{ text: '/admin' }]],
	resize_keyboard: true,
	one_time_keyboard: false,
};

export const testSaveMenu = {
	keyboard: [[{ text: '/save' }, { text: '/saveAndSend' }]],
	resize_keyboard: true,
	one_time_keyboard: false,
};

export const testInlineButton = {
	remove_keyboard: true,
	selective: true,
	inline_keyboard: [[{ text: 'send', callback_data: 'clicked' }]],
	resize_keyboard: true,
	one_time_keyboard: false,
};
