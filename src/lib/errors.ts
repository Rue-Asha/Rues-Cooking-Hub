export class ValidationError extends Error {
	constructor(public errors: Record<string, string>) {
		super(`Invalid: ${Object.keys(errors).join(', ')}`);
	}
}

export class ImageError extends Error {
	constructor(public reason: 'not-image' | 'too-large' | 'download') {
		super(`Image error: ${reason}`);
	}
}
