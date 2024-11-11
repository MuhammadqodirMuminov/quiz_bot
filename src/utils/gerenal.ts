export function extractUniqueCode(text: string) {
	const words = text.split(' ');
	return words.length > 1 ? words[1] : null;
}
