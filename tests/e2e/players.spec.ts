import { expect, test } from '@playwright/test';
import sharp from 'sharp';

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
  const tokenBeforeSubmit = await page.evaluate(() =>
    sessionStorage.getItem('low-on-legs:create-player-token'),
  );
  await page.getByRole('button', { name: 'Dodaj gracza' }).click();

  await expect(page.getByText('Ten pseudonim jest już zajęty.')).toBeVisible();
  await expect(page.getByLabel('Pseudonim')).toHaveValue('  zajęty nick  ');
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem('low-on-legs:create-player-token'),
    ),
  ).toBe(tokenBeforeSubmit);

  await page.getByLabel('Pseudonim').fill('Nowa próba');
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem('low-on-legs:create-player-token'),
    ),
  ).not.toBe(tokenBeforeSubmit);
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

test('odrzuca obcy origin i udostępnia wyłącznie przetworzony awatar WebP', async ({
  page,
}) => {
  await page.goto('/players/new');
  await fillPlayer(page, 'Z Awatarem');
  await page.getByRole('button', { name: 'Dodaj gracza' }).click();
  await expect(page).toHaveURL(/\/players\/[0-9a-f-]+$/);
  const playerId = new URL(page.url()).pathname.split('/').at(-1)!;
  const source = await sharp({
    create: { width: 400, height: 200, channels: 3, background: 'orange' },
  })
    .png()
    .toBuffer();

  const forbidden = await page.request.post(`/api/players/${playerId}/avatar`, {
    headers: { Origin: 'https://example.invalid' },
    multipart: {
      expectedVersion: '1',
      avatar: { name: 'avatar.png', mimeType: 'image/png', buffer: source },
    },
  });
  expect(forbidden.status()).toBe(403);

  await page.goto(`/players/${playerId}/edit`);
  await page.getByLabel('Plik awatara').setInputFiles({
    name: 'avatar.png',
    mimeType: 'image/png',
    buffer: source,
  });
  await page.getByRole('button', { name: 'Zapisz awatar' }).click();
  await expect(page.getByText('Awatar zapisano.')).toBeVisible();

  const response = await page.request.get(`/api/players/${playerId}/avatar`);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('image/webp');
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  const etag = response.headers().etag;
  expect(etag).toBeTruthy();
  const output = await response.body();
  expect(output).not.toEqual(source);
  expect(await sharp(output).metadata()).toMatchObject({
    format: 'webp',
    width: 256,
    height: 128,
  });

  const cached = await page.request.get(`/api/players/${playerId}/avatar`, {
    headers: { 'If-None-Match': etag },
  });
  expect(cached.status()).toBe(304);
});
