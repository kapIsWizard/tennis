import { expect, test } from '@playwright/test';

async function fillPlayer(
  page: import('@playwright/test').Page,
  nickname: string,
): Promise<void> {
  await page.getByLabel('Imię').fill('Adam');
  await page.getByLabel('Nazwisko').fill('Nowak');
  await page.getByLabel('Pseudonim').fill(nickname);
}

test('dodaje gracza bez awatara', async ({ page }) => {
  await page.goto('/players/new');
  await fillPlayer(page, 'Bez Awatara');
  await page.getByRole('button', { name: 'Dodaj gracza' }).click();

  await expect(page).toHaveURL(/\/players\/[0-9a-f-]+$/);
  await expect(page.getByRole('heading', { name: 'Bez Awatara' })).toBeVisible();
  await expect(page.getByText('Adam Nowak')).toBeVisible();
});

test('pokazuje konflikt pseudonimu i zachowuje formularz', async ({ page }) => {
  await page.goto('/players/new');
  await fillPlayer(page, 'Zajęty Nick');
  await page.getByRole('button', { name: 'Dodaj gracza' }).click();
  await expect(page).toHaveURL(/\/players\/[0-9a-f-]+$/);

  await page.goto('/players/new');
  await fillPlayer(page, '  zajęty nick  ');
  await page.getByRole('button', { name: 'Dodaj gracza' }).click();

  await expect(page.getByText('Ten pseudonim jest już zajęty.')).toBeVisible();
  await expect(page.getByLabel('Pseudonim')).toHaveValue('  zajęty nick  ');
});

test('potwierdza usunięcie klawiaturą', async ({ page }) => {
  await page.goto('/players/new');
  await fillPlayer(page, 'Do Usunięcia');
  await page.getByRole('button', { name: 'Dodaj gracza' }).click();
  await expect(page).toHaveURL(/\/players\/[0-9a-f-]+$/);

  await page.getByRole('button', { name: 'Usuń gracza' }).click();
  const confirm = page.getByRole('button', { name: 'Potwierdź usunięcie' });
  await confirm.focus();
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL('/players');
  await expect(page.getByRole('link', { name: 'Do Usunięcia' })).toHaveCount(0);
});
