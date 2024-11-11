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
};
