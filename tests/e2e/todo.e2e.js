import { test, expect } from '@playwright/test';

test('loads initial tasks and preserves them on reload', async ({ page }) => {
  await page.goto('./');

  const tasks = page
    .getByRole('list', { name: 'Lista de tareas' })
    .getByRole('button');

  await expect(page.getByRole('heading', {
    name: 'ToDo List React',
  })).toBeVisible();

  await expect(tasks).toHaveText([
    'Plan my week',
    'Buy groceries',
    'Finish my personal project',
  ]);

  await page.reload();

  await expect(tasks).toHaveCount(3);
});

test('adds, deletes, undoes and redoes tasks', async ({ page }) => {
  await page.goto('./');

  const tasks = page
    .getByRole('list', { name: 'Lista de tareas' })
    .getByRole('button');

  // Abrir formulario.
  await page.getByRole('button', { name: 'ADD' }).click();

  const dialog = page.getByRole('dialog', {
    name: 'Add item to list',
  });

  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox')).toBeFocused();

  // Añadir tarea.
  await dialog.getByRole('textbox').fill('Review Playwright tests');
  await dialog.getByRole('button', { name: 'ADD' }).click();

  await expect(dialog).toBeHidden();
  await expect(tasks).toHaveCount(4);

  // Seleccionar dos tareas.
  await page.getByRole('button', {
    name: 'Plan my week',
  }).click();

  await page.getByRole('button', {
    name: 'Review Playwright tests',
  }).click();

  // Eliminar selección.
  await page.getByRole('button', { name: 'DELETE' }).click();
  await expect(tasks).toHaveCount(2);

  // Deshacer.
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(tasks).toHaveCount(4);

  // Rehacer.
  await page.getByRole('button', { name: 'Redo' }).click();
  await expect(tasks).toHaveCount(2);

  // Verificar persistencia.
  await page.reload();
  await expect(tasks).toHaveCount(2);

  // El historial desaparece al recargar.
  await expect(page.getByRole('button', {
    name: 'Undo',
  })).toBeDisabled();
});
