import { beforeNavigate, goto } from '$app/navigation';
import { get, writable } from 'svelte/store';
import { NAVIGATION_CANCELLED } from '#lib/shell/pill.ts';

// Call during component init. In-app navigation with unsaved changes is cancelled and parked in `pending` for a
// dialog to resolve with keep() or discard(); leaving the page (reload, close, other site) is cancelled so the
// browser shows its own confirmation.
export function unsavedGuard(isDirty: () => boolean, { unload = () => true }: { unload?: () => boolean } = {}) {
	const pending = writable<URL | null>(null);
	let allowed = false;

	beforeNavigate((navigation) => {
		if (allowed || !isDirty()) return;
		// a form whose local draft holds everything loses nothing on reload or close, so the browser's prompt is dropped
		if (navigation.willUnload && !unload()) return;
		navigation.cancel();
		dispatchEvent(new Event(NAVIGATION_CANCELLED));
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
