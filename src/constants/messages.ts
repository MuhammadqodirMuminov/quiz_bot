import { IResult } from '../models/result.schema';
import { IAdsData } from '../types';

export const notAdmin = 'account is not admin';

export const mailUsersMsg =
	'Write text in the MARKDOWN markup or click cancel_mail';

// export const
export const testHomeMessage = `Choose your test or create new One!`;

export const test = {
	name: `Write name for your test! \nexample: Haftalik test`,
	text: `Give text for your test in MarkDown! \nexmaple: **🎉 Quiz Time! Test Your Knowledge 🎉**
📋 *How to participate:*  
1️⃣ Select the option you think is correct!  
2️⃣ Leave a comment with your answer, or click on the poll option below!  

🏆 *Prize:*  
One lucky winner will receive a special shoutout in our next post!

💡 *Hint:* It’s the fourth planet from the Sun!

---

Let’s see who the real space experts are! 🌌 Good luck, and may the best answer win! 🚀

#quiz #fun #knowledge #space
`,
	image: `Give images for your test!`,
	answers: `Give answers for your test in MarkDown! \nexmaple: abacbacbacabcbcab`,
	card: (code: number, name: string, count: number) => `

📝 **Description:** This is a sample test for evaluation.

---

### **Test Details:**

- **Test Code:** ${code}
- **Test Name:** ${name}
- **Count of Questions:** ${count}
---`,
	notFound: `Test code is not found. Please check again!`,
	wrongCount: `Test answers is less than count of questions`,
	wrongAnswer: `Test answers is wrong. Please check again!`,
};

export const checkAnswers = `
	👇👇👇 Yo'riqnoma.

1️⃣ Test javoblarini yuborish uchun 

test kodi*abbccdd... 
yoki
test kodi*1a2d3c4a5b...

kabi ko'rinishlarda yuboring

Misol: 
1234*abbccdd
yoki
1234*1a2d3c4a5b
`;

export const testResult = (
	testNomi: string,
	trueAnswersCount: number,
	falseAnswersCount: number,
	falseAnswers: { index: number; answer: string }[]
): string => {
	return `
# Test Result for "${testNomi}"

- **Correct Answers:** ${trueAnswersCount}
- **Incorrect Answers:** ${falseAnswersCount}

## Incorrect Answers Details
${
	falseAnswers.length > 0
		? falseAnswers
				.map(
					(fa) => `- **Question ${fa.index + 1}**:  True answer: ${fa.answer}`
				)
				.join('\n')
		: 'No incorrect answers!'
}
  `;
};

// Example usage:
const result = testResult('Sample Test', 8, 2, [
	{ index: 1, answer: 'B' },
	{ index: 3, answer: 'D' },
]);

export const ads = {
	homeMsg: `Choose your channels or create new One!`,
	channelName: `Enter channel name for ads\n<code>@channel_name</code>`,
};

export const userStats = (results: IResult[]): string => `
✨ **Sizning Test Statistikalaringiz:**
${results
	.map((result) => {
		return `
📝 **Test Ma'lumotlari**:
  - **Test Nomi**: ${result.test.name}
  - **Test Kodi**: ${result.test.code}

🎯 **Urinishlar Tarixi**:
${
	result?.atteps
		?.map((a, i) => {
			return `    ${i + 1}. **Ball**: ${a.score} ✅  |  **Urush #${i + 1}**`;
		})
		.join('\n') || "    Hali urinishlar yo'q 🚫"
}

📊 **Davom eting!** Ko'proq testlar topshiring va ko'nikmalaringizni oshiring! 🔥  
    `;
	})
	.join('\n')}
🌟 **Mehnatingizni qadrlaymiz!**
`;

export const adminStatus = (status: boolean): string =>
	`Выберите действие\n\nstatus: ${status}`;

export const adsOnMessage = (status: boolean) => `Реклама включена : ${status}`;

export const shortName = () =>
	`Укажите короткое имя для нового рекламного поста`;

export const adsData = (ads: Partial<IAdsData>) => `
SHortName: ${ads.shortName}\n
Укажите текст рекламного поста в разметке MARKDOWN`;

export const adsText = (ads: Partial<IAdsData>) => `
ShortName: ${ads.shortName}\n
Укажите текст inline кнопки, если кнопка не нужна - отправьте 0`;

export const adsBtnText = `1 - прикрепить файл\n0- не прикреплять`;

export const adsBtnText2 = `Укажите ссылку к inline кнопке`;

export const adsMedia = `Прикрепите медиа (jpg .jpeg .mp4)`;

export const adsMediaText = `1 - прикрепить файл\n0- не прикреплять\n\n.jpg .jpeg .mp4`;

export const adsMediaText2 = (shortName: string, text: string) =>
	`**Shortname: ${shortName}** \n${text}`;

export const adsCreate = `Рекламный пост добавлен`;

export const adminStat = (
	usersCount: number,
	adminsCount: number,
	testsCount: number,
	subscriptionsCount: number
) => `
📊 **Admin Statistics**

👤 **Admins**
- **Count**: ${adminsCount}

🧑‍🤝‍🧑 **Users**
- **Count**: ${usersCount}

📝 **Tests**
- **Count**: ${testsCount}

📡 **Subscriptions**
- **Count**: ${subscriptionsCount}

--------------------------------------------------
*Generated on: ${new Date().toLocaleString()}*
`;

export const joinMessage = (channels: string[]) => {
	const channelLinks = channels
		.map((channel) => `<a href="https://t.me/${channel.link}">@${channel}</a>`)
		.join(' va ');

	return `
		☝️ <b>Hurmatli foydalanuvchi,</b>

		Siz ${channelLinks} kanallariga a'zo bo'lishingiz shart.  
		A'zo bo'lmasangiz, botdan foydalana olmaysiz.  

		✅ A'zo bo'lganingizdan so'ng, qayta urinib ko'ring.`;
};

export const helloMessage = `🎉 **Botimizga Xush Kelibsiz!** 🎉  

✅ Siz muvaffaqiyatli tizimga kirdingiz va endi quyidagi imkoniyatlardan foydalanishingiz mumkin:  

📝 **Online Testlar:**  
Turli mavzular bo'yicha testlarni yechib, bilimlaringizni sinab ko'ring.  

📊 **Natijalarni Tahlil Qilish:**  
Test natijalaringizni ko'rib chiqib, o'z mahoratingizni oshiring.  

🔗 **Foydali Kanal va Guruhlar:**  
Bizning hamkor kanallarimizga ulanishni unutmang!  

🚀 **Bilim sari birinchi qadamni qo'ying!**  
`;

export const results = (results: IResult[], code: string) => `
💡 **Test natijalari!**
🔰 **Test kodi:** ${code}  
👨 **Test qatnashchilari:** ${results.length} ta
📝 **Kalitlar:** ${results[0].test.answers
	.split('')
	.map((test, i) => `${i + 1}-${test.toUpperCase()}`)}

${results.map(
	({ user, atteps }, i) =>
		`${i + 1}. ${user.username ? '@' : ''}${user.username} - ${
			atteps[0].score
		}\n`
)}
`;
