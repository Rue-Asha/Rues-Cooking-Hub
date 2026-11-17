let photo = $state<string | null>(null);

export const stage = {
	get photo() {
		return photo;
	}
};

// A page's photo becomes the frame's stage; the layout renders it behind the bar and the head.
export function useStage(get: () => string | null) {
	$effect(() => {
		photo = get();
		return () => {
			photo = null;
		};
	});
}
