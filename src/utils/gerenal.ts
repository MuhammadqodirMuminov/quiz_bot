export function extractUniqueCode(text: string) {
	const words = text.split(' ');
	return words.length > 1 ? words[1] : null;
}

export function extractNumberAndString(input: string): { number: number; pattern: string; rest: string } | null {
	const match = input.match(/^(\d+)\*([a-zA-Z]+)(.*)$/);

	if (!match) return null;

	const number = parseInt(match[1], 10);
	const pattern = match[2];
	const rest = match[3];

	return { number, pattern, rest };
}

export function countMatchingAnswers(pattern: string, answers: string): { correctMatches: number; wrongAnswers: { index: number; answer: string }[] } {
	let correctMatches = 0;
	const wrongAnswers = [];

	for (let i = 0; i < pattern.length; i++) {
		if (pattern[i] === answers[i]) {
			correctMatches++;
		} else {
			wrongAnswers.push({ index: i, answer: answers[i] });
		}
	}

	return { correctMatches, wrongAnswers };
}
