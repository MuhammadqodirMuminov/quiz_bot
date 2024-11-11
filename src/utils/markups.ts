export const adminMenu = {
	keyboard: [
		[{ text: '/stat', }], 
		[{ text: '/test' }, { text: '/mail_users' }],
		[{ text: '/subscription' }, { text: '/ads' }]
	],
	resize_keyboard: true,
	one_time_keyboard: false,
};

export const cancelMail = {
	keyboard: [
		[{ text: 'cancel_mail' }]
	]
}

export const cancelAndPushMail = {
	keyboard: [
		[{ text: 'cancel_mail' }, { text: 'push_mail' }]
	]
}