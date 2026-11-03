import type { NavItem } from '#lib/ui/PillNav.svelte';

export type Area = 'home' | 'recipes' | 'plan' | 'list' | 'eating-out';

export const areas: (NavItem & { area: Area })[] = [
	{ area: 'home', href: '/', label: 'Home', icon: 'home' },
	{ area: 'recipes', href: '/recipes', label: 'Recipes', icon: 'book' },
	{ area: 'plan', href: '/plan', label: 'Plan', icon: 'calendar' },
	{ area: 'list', href: '/list', label: 'List', icon: 'basket' },
	{ area: 'eating-out', href: '/eating-out', label: 'Eating Out', icon: 'pin', divider: true }
];

export function activeArea(pathname: string): Area {
	const segment = pathname.split('/')[1];
	return areas.find((a) => a.area !== 'home' && a.area === segment)?.area ?? 'home';
}

interface HeaderAction {
	label: string;
	href: string;
}

export function headerActions(area: Area): { search: HeaderAction; add: HeaderAction } {
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
