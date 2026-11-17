// The status notices are announced once and clear themselves after about six seconds (contract 4.10); one is on screen at a time.
export const notices: { id: number; text: string; kind: 'status' | 'alert' }[] = $state([]);

let next = 1;

export function notify(text: string, kind: 'status' | 'alert' = 'status') {
	const id = next++;
	notices.splice(0, notices.length, { id, text, kind });
	setTimeout(() => {
		const at = notices.findIndex((n) => n.id === id);
		if (at !== -1) notices.splice(at, 1);
	}, 6000);
}
