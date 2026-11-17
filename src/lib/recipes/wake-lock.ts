// Holds a screen wake lock until the returned function runs. The browser drops the lock whenever the page is hidden,
// so it is requested again on the next visible event. No API or a denied request leaves the page as it was.
export function keepAwake(): () => void {
	const api = typeof navigator === 'undefined' ? undefined : navigator.wakeLock;
	if (!api) return () => {};

	let sentinel: WakeLockSentinel | null = null;
	let pending = false;
	let stopped = false;

	async function request() {
		pending = true;
		try {
			const lock = await api!.request('screen');
			if (stopped) return void lock.release().catch(() => {});
			sentinel = lock;
			lock.addEventListener('release', () => {
				if (sentinel === lock) sentinel = null;
			});
		} catch {
			// denied or unavailable: nothing to show
		} finally {
			pending = false;
		}
	}

	const onVisible = () => {
		if (document.visibilityState === 'visible' && !sentinel && !pending && !stopped) void request();
	};

	document.addEventListener('visibilitychange', onVisible);
	void request();

	return () => {
		if (stopped) return;
		stopped = true;
		document.removeEventListener('visibilitychange', onVisible);
		void sentinel?.release().catch(() => {});
		sentinel = null;
	};
}
