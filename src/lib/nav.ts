import type { NavItem } from '#lib/ui/PillNav.svelte';

export type Area = 'home' | 'recipes' | 'plan' | 'list';

export const areas: (NavItem & { area: Area })[] = [
	{ area: 'home', href: '/', label: 'Home', icon: 'home' },
	{ area: 'recipes', href: '/recipes', label: 'Recipes', icon: 'book' },
	{ area: 'plan', href: '/plan', label: 'Plan', icon: 'calendar' },
	{ area: 'list', href: '/list', label: 'List', icon: 'basket' }
];

export function activeArea(pathname: string): Area {
	const segment = pathname.split('/')[1];
	return areas.find((a) => a.area !== 'home' && a.area === segment)?.area ?? 'home';
}
