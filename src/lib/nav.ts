import type { IconName } from '#lib/ui/Icon.svelte';

export type Area = 'home' | 'recipes' | 'plan' | 'list' | 'eating-out';

export const POSTURE_SWITCH = 1024;

interface AreaLink {
	area: Area;
	href: string;
	label: string;
	phoneLabel: string;
	icon: IconName;
}

export const areas: AreaLink[] = [
	{ area: 'home', href: '/', label: 'Home', phoneLabel: 'Home', icon: 'home' },
	{ area: 'recipes', href: '/recipes', label: 'Recipes', phoneLabel: 'Recipes', icon: 'book' },
	{ area: 'plan', href: '/plan', label: 'Plan', phoneLabel: 'Plan', icon: 'calendar' },
	{ area: 'list', href: '/list', label: 'List', phoneLabel: 'List', icon: 'basket' },
	{ area: 'eating-out', href: '/eating-out', label: 'Eating Out', phoneLabel: 'Spots', icon: 'pin' }
];

export function activeArea(pathname: string): Area {
	const segment = pathname.split('/')[1];
	return areas.find((a) => a.area !== 'home' && a.area === segment)?.area ?? 'home';
}

export interface HeaderAction {
	label: string;
	href: string;
}

export type HeaderActions = { search: HeaderAction; add: HeaderAction };

export function headerActions(area: Area): HeaderActions {
	if (area === 'eating-out') {
		return {
			search: { label: 'Search spots', href: '/eating-out#search' },
			add: { label: 'Add spot', href: '/eating-out/new' }
		};
	}
	return {
		search: { label: 'Search recipes', href: '/recipes' },
		add: { label: 'Add recipe', href: '/recipes/new' }
	};
}

// the recipe form routes keep the phone's "+" hidden and inert: Save is the one way forward there
export function plusHidden(pathname: string): boolean {
	return /^\/recipes\/new(\/|$)/.test(pathname) || /^\/recipes\/[^/]+\/edit\/?$/.test(pathname);
}
