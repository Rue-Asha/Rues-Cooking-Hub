import { expect, test } from '@playwright/test';
import { open, phoneBar, plus, reset } from './helpers.ts';

test.beforeEach(({}, info) => test.skip(info.project.name !== 'phone', 'phone layout'));

test('Scenario: Plus on List focuses the add field', async ({ page, request }) => {
	await reset(request);
	await open(page, '/list');
	const field = page.getByRole('textbox', { name: 'Add an item' });
	await expect(plus(page)).toHaveAccessibleName('Add an item');

	await plus(page).click();

	await expect(field).toBeFocused();
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(page).toHaveURL('/list');
	await expect(phoneBar(page)).toBeHidden();
	const flow = await page.evaluate(() => {
		const input = document.activeElement as HTMLElement;
		const heading = document.querySelector('main h1')!;
		let fixed = false;
		for (let el: Element | null = input; el && el !== document.body; el = el.parentElement) {
			if (getComputedStyle(el).position === 'fixed') fixed = true;
		}
		return { after: !!(heading.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING), fixed };
	});
	expect(flow).toEqual({ after: true, fixed: false });
});

test('Scenario: List item from the Home sheet focuses the add field', async ({ page, request }) => {
	await reset(request);
	await open(page, '/');
	await plus(page).click();
	await page.getByRole('dialog', { name: 'Add to your kitchen' }).getByRole('link', { name: /^List item/ }).click();

	const field = page.getByRole('textbox', { name: 'Add an item' });
	await expect(page).toHaveURL('/list');
	await expect(field).toBeFocused();
	await page.keyboard.type('2 l oat milk');
	await page.keyboard.press('Enter');

	const milk = page.getByRole('region', { name: 'To buy' }).getByRole('listitem').filter({ hasText: 'oat milk' });
	await expect(milk).toHaveCount(1);
	await expect(milk).toContainText('2 l');
});
