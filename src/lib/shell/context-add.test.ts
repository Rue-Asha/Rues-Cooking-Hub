import { beforeEach, describe, expect, it, vi } from 'vitest';

const nav = vi.hoisted(() => ({ goto: vi.fn(), replaceState: vi.fn() }));
vi.mock('$app/navigation', () => nav);

import { addHref, contextAdd, registerContextAdd, takeAddFlag } from './context-add.svelte.ts';

beforeEach(() => {
	nav.goto.mockReset();
	nav.replaceState.mockReset();
});

describe('context-add', () => {
	it('calls the registered handler synchronously and does not navigate', () => {
		const calls: string[] = [];
		const unregister = registerContextAdd(() => calls.push('handler'));
		contextAdd('plan');
		calls.push('after');
		expect(calls).toEqual(['handler', 'after']);
		expect(nav.goto).not.toHaveBeenCalled();
		unregister();
	});

	it('falls back to the area href once the handler is unregistered', () => {
		const handler = vi.fn();
		const unregister = registerContextAdd(handler);
		unregister();
		contextAdd('recipes');
		expect(handler).not.toHaveBeenCalled();
		expect(nav.goto).toHaveBeenCalledWith('/recipes/new');
	});

	it('an old unregister does not remove a newer handler', () => {
		const first = vi.fn();
		const second = vi.fn();
		const unregisterFirst = registerContextAdd(first);
		const unregisterSecond = registerContextAdd(second);
		unregisterFirst();
		contextAdd('list');
		expect(second).toHaveBeenCalledOnce();
		unregisterSecond();
	});

	it('has a fallback href per area', () => {
		expect(addHref('home')).toBeNull();
		expect(addHref('recipes')).toBe('/recipes/new');
		expect(addHref('plan')).toBeNull();
		expect(addHref('list')).toBeNull();
		expect(addHref('eating-out')).toBe('/eating-out/new');
	});

	it('goes to the add href of Eating Out and does nothing for areas without one', () => {
		contextAdd('eating-out');
		expect(nav.goto).toHaveBeenCalledWith('/eating-out/new');
		nav.goto.mockReset();
		contextAdd('home');
		contextAdd('plan');
		contextAdd('list');
		expect(nav.goto).not.toHaveBeenCalled();
	});

	it('takeAddFlag strips add=1 and keeps the rest of the url', () => {
		expect(takeAddFlag(new URL('http://x/plan?add=1&week=2026-11-16#top'))).toBe(true);
		expect(nav.replaceState).toHaveBeenCalledWith('/plan?week=2026-11-16#top', {});
		nav.replaceState.mockReset();
		expect(takeAddFlag(new URL('http://x/list?add=1'))).toBe(true);
		expect(nav.replaceState).toHaveBeenCalledWith('/list', {});
	});

	it('takeAddFlag leaves other urls alone', () => {
		expect(takeAddFlag(new URL('http://x/plan'))).toBe(false);
		expect(takeAddFlag(new URL('http://x/plan?add=2'))).toBe(false);
		expect(nav.replaceState).not.toHaveBeenCalled();
	});
});
