import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'LanguageModel', {
      configurable: true,
      value: {
        availability: async () => 'available',
        create: async () => ({
          clone: async () => ({
            prompt: async () => JSON.stringify({
              text: 'Tarea generada',
            }),
            destroy: () => {},
          }),
          destroy: () => {},
        }),
      },
    });
  });
});

test('starts empty and persists new tasks', async ({ page }) => {
  await page.goto('./');

  const tasks = page.getByRole('list', {
    name: 'Lista de tareas',
  }).getByRole('button');

  await expect(page.getByRole('heading', {
    name: 'ToDo IA',
  })).toBeVisible();

  await expect(tasks).toHaveCount(0);

  await page.getByRole('button', {
    name: 'AÑADIR',
  }).click();

  const dialog = page.getByRole('dialog');

  await dialog.getByRole('textbox').fill('Comprar pan');
  await dialog.getByRole('button', {
    name: 'AÑADIR',
  }).click();

  await expect(tasks).toHaveCount(1);

  await page.reload();

  await expect(tasks).toHaveText(['Comprar pan']);
});

test('deletes, undoes and redoes tasks', async ({ page }) => {
  await page.goto('./');

  for (const text of ['Comprar pan', 'Hacer deporte']) {
    await page.getByRole('button', {
      name: 'AÑADIR',
    }).click();

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox').fill(text);
    await dialog.getByRole('button', {
      name: 'AÑADIR',
    }).click();
  }

  const tasks = page.getByRole('list', {
    name: 'Lista de tareas',
  }).getByRole('button');

  await page.getByRole('button', {
    name: 'Comprar pan',
  }).click();

  await page.getByRole('button', {
    name: 'Hacer deporte',
  }).click();

  await page.getByRole('button', {
    name: 'ELIMINAR',
  }).click();

  await expect(tasks).toHaveCount(0);

  await page.getByRole('button', {
    name: 'Deshacer',
  }).click();

  await expect(tasks).toHaveCount(2);

  await page.getByRole('button', {
    name: 'Rehacer',
  }).click();

  await expect(tasks).toHaveCount(0);
});
