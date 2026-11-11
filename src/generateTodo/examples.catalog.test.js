import { describe, expect, it } from 'vitest';
import { examples } from './examples.js';
import { normalizeTaskTitle } from './generationGuard.js';

describe('Catálogo amplio de muestras', () => {
  it('contiene al menos 180 ejemplos bilingües bien formados', () => {
    expect(examples.length).toBeGreaterThanOrEqual(180);
    for (const pair of examples) {
      expect(pair).toHaveLength(2);
      for (const title of pair) {
        expect(typeof title).toBe('string');
        expect(title.trim().length).toBeGreaterThan(8);
        expect(title.length).toBeLessThanOrEqual(120);
      }
    }
  });

  it('no tiene muestras españolas duplicadas tras normalizar', () => {
    const normalized = examples.map((pair) => normalizeTaskTitle(pair[0]));
    expect(new Set(normalized).size).toBe(normalized.length);
  });

  it('no tiene muestras inglesas duplicadas', () => {
    const normalized = examples.map((pair) => pair[1].toLowerCase().trim());
    expect(new Set(normalized).size).toBe(normalized.length);
  });
});
