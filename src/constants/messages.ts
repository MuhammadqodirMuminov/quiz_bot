export const notAdmin = 'account is not admin';

export const mailUsersMsg = 'Write text in the MARKDOWN markup or click cancel_mail';

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

export const testResult = (testNomi: string, trueAnswersCount: number, falseAnswersCount: number, falseAnswers: { index: number; answer: string }[]): string => {
	return `
# Test Result for "${testNomi}"

- **Correct Answers:** ${trueAnswersCount}
- **Incorrect Answers:** ${falseAnswersCount}

## Incorrect Answers Details
${falseAnswers.length > 0 ? falseAnswers.map(fa => `- **Question ${fa.index + 1}**: Your answer: ${fa.answer}`).join('\n') : 'No incorrect answers!'}
  `;
};

// Example usage:
const result = testResult('Sample Test', 8, 2, [
	{ index: 1, answer: 'B' },
	{ index: 3, answer: 'D' },
]);

console.log(result);
