/**
 * Capturas deterministas de la aplicación ToDo IA incluida en todo-hyperframes.
 *
 * No ejecuta ni suplanta inferencias de Gemini Nano: las categorías y las
 * traducciones provienen de fixtures con el esquema real de localStorage.
 * No modifica src/, el perfil del navegador del usuario ni la app publicada.
 *
 * Ejecutar desde la raíz: node hyperframes/capture/capture.mjs
 */
import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { DEMO_TODOS, getSeed } from './fixtures.mjs';

const ROOT = process.cwd();
const TARGET = path.join(ROOT, 'hyperframes', 'promo', 'assets', 'captures');
const BASE = 'http://127.0.0.1:5190/todo-hyperframes/';
const SHOT_SIZE = { width: 1920, height: 1080 };
const MOBILE_SIZE = { width: 390, height: 844 };
const manifest = [];

async function assertRoot() {
  try { await access(path.join(ROOT, 'vite.config.js')); }
  catch { throw new Error('Ejecuta este script desde la raíz del repositorio React (vite.config.js).'); }
}

async function makePage(browser, options = {}) {
  const { theme = 'light', language = 'es', todos = DEMO_TODOS, viewport = SHOT_SIZE } = options;
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    locale: language === 'es' ? 'es-ES' : 'en-US',
    reducedMotion: 'reduce',
    colorScheme: theme === 'dark' ? 'dark' : 'light',
  });

  // Datos aislados en un contexto nuevo. No hay llamadas de IA ni red de terceros.
  const seed = getSeed({ theme, language, todos });
  await context.addInitScript((entries) => {
    // Impedimos que una instalación local de Gemini Nano introduzca
    // resultados no deterministas en esta serie de fotos.
    Object.defineProperty(window, 'LanguageModel', { configurable: true, value: undefined });
    for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value);
  }, seed);

  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'ToDo IA' }).waitFor({ state: 'visible', timeout: 15000 });

  // El proyecto abre un diálogo de instalación si LanguageModel no existe.
  // Lo cerramos mediante su botón real, sin eliminar nodos ni alterar React.
  const dialog = page.locator('dialog[open]');
  await dialog.waitFor({ state: 'visible', timeout: 5000 });
  await dialog.locator('button').last().click();
  await dialog.waitFor({ state: 'hidden' });

  // Esperar a las fuentes asegura que las dimensiones del texto sean reproducibles.
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.card').waitFor({ state: 'visible' });
  await page.waitForTimeout(120);

  return { page, context };
}

async function shot(page, id, description, { crop = true } = {}) {
  if (await page.locator('dialog[open]').count() > 0 && id !== '07-add-modal') {
    throw new Error(`Diálogo inesperado al capturar ${id}`);
  }

  const full = `${id}.png`;
  await page.screenshot({ path: path.join(TARGET, full), animations: 'disabled', caret: 'hide' });
  const asset = { id, description, screenshot: `assets/captures/${full}` };

  if (crop && id !== '07-add-modal') {
    const card = `${id}-card.png`;
    await page.locator('.card').screenshot({
      path: path.join(TARGET, card),
      animations: 'disabled',
      caret: 'hide',
    });
    asset.card = `assets/captures/${card}`;
  }

  manifest.push(asset);
  process.stdout.write(`✓ ${id}\n`);
}

async function run() {
  await assertRoot();
  await mkdir(TARGET, { recursive: true });
  const server = await createServer({
    server: { host: '127.0.0.1', port: 5190, strictPort: true },
    clearScreen: false,
  });
  let browser;
  try {
    await server.listen();
    browser = await chromium.launch({ headless: true });

    {
      const { page, context } = await makePage(browser);
      try {
        await shot(page, '01-overview-light', 'Lista con tareas, IA y filtros visibles · tema claro');

        await page.getByRole('button', { name: DEMO_TODOS[0].text }).click();
        await shot(page, '02-selected-category', 'Seleccionar una tarea marca internamente sus categorías, sin filtrar');

        const trabajo = page.getByRole('button', { name: /^Trabajo: \d+$/ });
        await trabajo.click();
        await shot(page, '03-filter-highlight', 'Categoría activa y Todas las tareas aún visibles');

        await page.getByRole('button', { name: /^Todos$/ }).click();
        await page.getByRole('button', { name: DEMO_TODOS[4].text }).waitFor({ state: 'hidden' });
        await shot(page, '04-filtered-tasks', 'Filtro Trabajo aplicado con OR, Todos desactivado');
      } finally { await context.close(); }
    }

    {
      const { page, context } = await makePage(browser, { theme: 'dark' });
      try { await shot(page, '05-dark-theme', 'Tema oscuro de ToDo IA'); }
      finally { await context.close(); }
    }

    {
      const { page, context } = await makePage(browser, { theme: 'radioactive' });
      try { await shot(page, '06-radioactive-theme', 'Tema Radioactivo de ToDo IA'); }
      finally { await context.close(); }
    }

    {
      const { page, context } = await makePage(browser);
      try {
        await page.getByRole('button', { name: /^AÑADIR$/ }).last().click();
        const dialog = page.locator('dialog[open]');
        await dialog.waitFor({ state: 'visible' });
        await dialog.getByRole('textbox').fill('Planificar un nuevo objetivo');
        await shot(page, '07-add-modal', 'Modal real de creación de tarea, con texto escrito', { crop: false });
      } finally { await context.close(); }
    }

    {
      const { page, context } = await makePage(browser, { language: 'en' });
      try {
        await page.getByRole('button', { name: DEMO_TODOS[0].translations.en }).waitFor();
        await shot(page, '08-english-translation', 'Interfaz inglesa y traducciones precargadas sin inferencia');
      } finally { await context.close(); }
    }

    {
      const { page, context } = await makePage(browser);
      try {
        await page.getByRole('button', { name: DEMO_TODOS[0].text }).click();
        await page.getByRole('button', { name: DEMO_TODOS[1].text }).click();
        await shot(page, '09-multi-selection', 'Selección múltiple antes de eliminación');

        await page.getByRole('button', { name: /^ELIMINAR$/ }).click();
        await shot(page, '10-after-delete', 'Tareas eliminadas, posibilidad de deshacer');

        await page.getByRole('button', { name: 'Deshacer' }).click();
        await shot(page, '11-after-undo', 'Tareas restauradas, posibilidad de rehacer');
      } finally { await context.close(); }
    }

    {
      const { page, context } = await makePage(browser, { todos: [] });
      try { await shot(page, '12-empty-filters', 'Mensaje real de umbral de filtros con cero tareas'); }
      finally { await context.close(); }
    }

    {
      const { page, context } = await makePage(browser, { viewport: MOBILE_SIZE });
      try { await shot(page, '13-mobile-layout', 'Diseño móvil de ToDo IA', { crop: false }); }
      finally { await context.close(); }
    }

    await writeFile(
      path.join(TARGET, 'manifest.json'),
      `${JSON.stringify({ schema: 1, source: 'ToDo IA · fixtures locales; no son resultados de IA en vivo', viewport: SHOT_SIZE, shots: manifest }, null, 2)}\n`,
      'utf8',
    );
    process.stdout.write(`\nCapturas creadas en: ${TARGET}\n`);
    process.stdout.write(`${manifest.length} escenas · capturas generales y recortes de interfaz.\n`);
  } finally {
    await browser?.close();
    await server.close();
  }
}

run().catch((error) => {
  console.error('Error al generar capturas:', error);
  process.exitCode = 1;
});
