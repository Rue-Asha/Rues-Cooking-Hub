export const COPY = {
	titleRequired: 'Title is required',
	servingsMin: 'Servings must be at least 1',
	minutesInvalid: 'Enter whole minutes, 0 or more',
	entryEmpty: 'Enter a recipe or some text',
	notImage: "That file isn't an image",
	tooLarge: 'Images can be at most 15 MB',
	imageFailed: "Saved without image: the image couldn't be downloaded.",
	imageKept: "The new image couldn't be downloaded; the previous image was kept.",
	importFailed: "Couldn't read a recipe from this page",
	invalidUrl: 'Enter a valid web address (http or https)',
	duplicate: 'Already in your archive',
	amountInvalid: 'Enter an amount like 200 g',
	nothingToCopy: 'Nothing to copy',
	nothingPlanned: 'Nothing planned in this range',
	noMatch: 'No recipes match',
	discard: 'Discard changes?'
} as const;
