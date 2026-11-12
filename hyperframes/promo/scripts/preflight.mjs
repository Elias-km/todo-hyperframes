import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  '01-overview-light-card.png',
  '02-selected-category-card.png',
  '04-filtered-tasks-card.png',
  '05-dark-theme-card.png',
  '06-radioactive-theme-card.png',
  '08-english-translation-card.png',
  '09-multi-selection-card.png',
  '11-after-undo-card.png',
];

const missing = [];
for (const filename of required) {
  const image = path.join(ROOT, 'assets', 'captures', filename);
  try {
    const data = await readFile(image);
    if (data.length < 24 || data.toString('hex', 0, 8) !== '89504e470d0a1a0a') throw Error('PNG inválido');
  } catch { missing.push(filename); }
}

for (const filename of ['todo-pulse.mp3', 'impact.wav']) {
  try { await access(path.join(ROOT, 'assets', 'audio', filename)); }
  catch { missing.push(`audio/${filename}`); }
}

if (missing.length) {
  console.error('Faltan recursos para renderizar:');
  missing.forEach((file) => console.error(`  - ${file}`));
  console.error('\nDesde la raíz del repositorio ejecuta npm run capture:promo y vuelve a comprobar.');
  process.exitCode = 1;
} else {
  console.log(`OK · ${required.length} capturas auténticas + 2 archivos de audio. Listo para HyperFrames.`);
}
