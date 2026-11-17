import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { keepAwake } from './wake-lock.ts';

type Sentinel = EventTarget & { release: ReturnType<typeof vi.fn> };

function setup(request: () => Promise<Sentinel>) {
	const listeners = new Map<string, () => void>();
	const doc = {
		visibilityState: 'visible',
		addEventListener: (type: string, fn: () => void) => listeners.set(type, fn),
		removeEventListener: (type: string) => listeners.delete(type)
	};
	vi.stubGlobal('document', doc);
	vi.stubGlobal('navigator', { wakeLock: { request: vi.fn(request) } });
	return { doc, listeners, request: (navigator as unknown as { wakeLock: { request: ReturnType<typeof vi.fn> } }).wakeLock.request };
}

const sentinel = (): Sentinel => {
	const s = new EventTarget() as Sentinel;
	s.release = vi.fn(async () => {
		s.dispatchEvent(new Event('release'));
	});
	return s;
};
const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => vi.unstubAllGlobals());
afterEach(() => vi.unstubAllGlobals());

describe('keepAwake', () => {
	it('requests a screen lock and releases it once when stopped', async () => {
		const s = sentinel();
		const env = setup(async () => s);
		const stop = keepAwake();
		await flush();
		expect(env.request).toHaveBeenCalledExactlyOnceWith('screen');
		stop();
		stop();
		expect(s.release).toHaveBeenCalledTimes(1);
		expect(env.listeners.size).toBe(0);
	});

	it('requests again when the page turns visible after the lock was released', async () => {
		const first = sentinel();
		const env = setup(async () => (env.request.mock.calls.length === 1 ? first : sentinel()));
		keepAwake();
		await flush();
		first.dispatchEvent(new Event('release'));
		env.doc.visibilityState = 'visible';
		env.listeners.get('visibilitychange')!();
		await flush();
		expect(env.request).toHaveBeenCalledTimes(2);
	});

	it('does not request again while a lock is held or the page is hidden', async () => {
		const env = setup(async () => sentinel());
		keepAwake();
		await flush();
		env.listeners.get('visibilitychange')!();
		env.doc.visibilityState = 'hidden';
		env.listeners.get('visibilitychange')!();
		await flush();
		expect(env.request).toHaveBeenCalledTimes(1);
	});

	it('releases a lock that arrives after stop', async () => {
		const s = sentinel();
		const env = setup(async () => s);
		keepAwake()();
		await flush();
		expect(env.request).toHaveBeenCalledTimes(1);
		expect(s.release).toHaveBeenCalledTimes(1);
	});

	it('does nothing without the API', () => {
		vi.stubGlobal('navigator', {});
		vi.stubGlobal('document', { addEventListener: vi.fn() });
		expect(() => keepAwake()()).not.toThrow();
	});

	it('swallows a denied request', async () => {
		setup(async () => {
			throw new DOMException('no', 'NotAllowedError');
		});
		const stop = keepAwake();
		await flush();
		expect(() => stop()).not.toThrow();
	});
});
