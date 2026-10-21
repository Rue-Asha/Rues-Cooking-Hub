import { error } from '@sveltejs/kit';

export function testFlag(): boolean {
	return process.env.COOKING_HUB_TEST === '1';
}

export function requireTestFlag(): void {
	if (!testFlag()) error(404, 'Not found');
}
