import { beforeNavigate, goto } from '$app/navigation';
import { get, writable } from 'svelte/store';

// Call during component init. In-app navigation with unsaved changes is cancelled and parked in `pending` for a
// dialog to resolve with keep() or discard(); leaving the page (reload, close, other site) is cancelled so the
// browser shows its own confirmation.
export function unsavedGuard(isDirty: () => boolean) {
	const pending = writable<URL | null>(null);
	let allowed = false;

	beforeNavigate((navigation) => {
		if (allowed || !isDirty()) return;
		navigation.cancel();
		if (!navigation.willUnload && navigation.to) pending.set(navigation.to.url);
	});

	return {
		pending: { subscribe: pending.subscribe },
		// a successful save navigates away on purpose
		allow() {
			allowed = true;
		},
		keep() {
			pending.set(null);
		},
		discard() {
			const url = get(pending);
			pending.set(null);
			allowed = true;
			if (url) void goto(url).finally(() => (allowed = false));
		}
	};
}
