export function sanitizeMention(value: string): string {
	const match = value.match(/^<(?:@[!&]?|#)(\d+)>$/);
	return match ? match[1] : value;
}
