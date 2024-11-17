import TelegramBot, { SendMessageOptions } from 'node-telegram-bot-api'

export const adminMenu = {
	keyboard: [
		[{ text: '/stat' }],
		[{ text: '/test' }, { text: '/mail_users' }],
		[{ text: '/subscription' }, { text: '/ads' }],
	],
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

export const testInlineButton = (
	code: number
): SendMessageOptions['reply_markup'] => ({
	remove_keyboard: true,
	selective: true,
	inline_keyboard: [
		[{ text: 'send', callback_data: `send_test_${code}` }],
		[
			{
				text: '❌ delete test',
				callback_data: `edit_test_${code}`,
			},
		],
	],
	resize_keyboard: true,
	one_time_keyboard: false,
});

export const cancelMail = {
	keyboard: [[{ text: 'cancel_mail' }]],
	resize_keyboard: true,
	one_time_keyboard: false,
};

export const cancelAndPushMail = {
	keyboard: [[{ text: 'cancel_mail' }, { text: 'push_mail' }]],
	resize_keyboard: true,
	one_time_keyboard: false,
};

export const userMenu: TelegramBot.SendMessageOptions['reply_markup'] = {
	keyboard: [[{ text: '/checkAnswers' }, { text: '/userStat' }]],
	resize_keyboard: true,
	one_time_keyboard: false,
};

export const offMarkup: TelegramBot.SendMessageOptions['reply_markup'] = {
	remove_keyboard: true,
	selective: true,
};

export const subscribeMenu = {
	keyboard: [
		[{ text: '/create' }, { text: '/getAll' }],
		[{ text: '/turnOff' }],
		[{ text: '/admin' }],
	],
	resize_keyboard: true,
	one_time_keyboard: false,
};

export const subscribeInlineButton = (
	username: string
): SendMessageOptions['reply_markup'] => ({
	inline_keyboard: [
		[
			{
				text: '❌ delete',
				callback_data: `delete_ads_${username}`,
			},
		],
	],
});
