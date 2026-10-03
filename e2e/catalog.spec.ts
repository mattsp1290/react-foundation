import { AxeBuilder } from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

function rgb(hex: string): string {
  const channels = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!channels) throw new Error(`${hex} is not a six-digit hex color`);
  return `rgb(${channels
    .slice(1)
    .map((channel) => parseInt(channel, 16))
    .join(', ')})`;
}

const token = (page: Page, name: string) =>
  page.evaluate(
    (property) =>
      getComputedStyle(document.documentElement)
        .getPropertyValue(property)
        .trim(),
    name,
  );

// The expected primitives per mode, by the names DESIGN.md gives them.
const modes = {
  light: { surface: '#f4f4f4', disabled: '#566c86', primary: '#3b5dc9' },
  dark: { surface: '#1a1c2c', disabled: '#94b0c2', primary: '#73eff7' },
};

for (const [mode, expected] of Object.entries(modes)) {
  test.describe(`${mode} mode`, () => {
    test('resolves the semantic roles', async ({ page }) => {
      await page.goto(`/?theme=${mode}`);
      await expect(page.locator('html')).toHaveAttribute('data-theme', mode);
      expect((await token(page, '--surface')).toLowerCase()).toBe(
        expected.surface,
      );
      expect((await token(page, '--disabled')).toLowerCase()).toBe(
        expected.disabled,
      );
      expect((await token(page, '--primary')).toLowerCase()).toBe(
        expected.primary,
      );
    });

    test('passes axe with idle forms', async ({ page }) => {
      await page.goto(`/?theme=${mode}`);
      await expect(
        page.getByRole('heading', { name: 'Account' }),
      ).toBeVisible();
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations).toEqual([]);
    });

    test('passes axe with both form alerts showing', async ({ page }) => {
      await page.goto(`/?theme=${mode}&login=error`);
      await page.getByRole('button', { name: 'Create account' }).click();
      await expect(
        page.getByText('Login failed. Check your credentials and try again.'),
      ).toBeVisible();
      await expect(
        page.getByText(/^Enter a username between 1 and 256 bytes/),
      ).toBeVisible();
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations).toEqual([]);
    });

    test('paints disabled buttons with the disabled recipe', async ({
      page,
    }) => {
      await page.goto(`/?theme=${mode}&login=pending`);
      const surface = rgb(await token(page, '--surface'));
      const disabled = rgb(await token(page, '--disabled'));
      for (const name of ['Disabled', 'Logging in…']) {
        const button = page.getByRole('button', { name });
        await expect(button).toBeDisabled();
        await expect(button).toHaveCSS('background-color', surface);
        await expect(button).toHaveCSS('color', disabled);
        await expect(button).toHaveCSS('border-top-width', '1px');
        await expect(button).toHaveCSS('border-top-style', 'solid');
        await expect(button).toHaveCSS('border-top-color', disabled);
      }
    });

    test('paints enabled buttons with the primary pair', async ({ page }) => {
      await page.goto(`/?theme=${mode}`);
      const button = page.getByRole('button', { name: 'Enabled' });
      await expect(button).toHaveCSS(
        'background-color',
        rgb(await token(page, '--primary')),
      );
      await button.hover();
      await expect(button).toHaveCSS(
        'background-color',
        rgb(await token(page, '--primary-container')),
      );
      await expect(button).toHaveCSS(
        'color',
        rgb(await token(page, '--on-primary-container')),
      );
    });
  });
}
