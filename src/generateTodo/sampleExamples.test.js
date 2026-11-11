import { describe, expect, it } from 'vitest';
import { getTenExamples } from './sampleExamples.js';

describe('Rotación de muestras', () => {
  it('selecciona 10 distintas por petición y no repite en los primeros 50 usos', () => {
    const used = [];
    for (let i = 0; i < 5; i++) {
      const sample = getTenExamples('es');
      expect(sample).toHaveLength(10);
      expect(new Set(sample).size).toBe(10);
      used.push(...sample);
    }
    expect(new Set(used).size).toBe(50);
  });

  it('no repite muestras dentro de una petición al renovar el mazo', () => {
    for (let i = 0; i < 10; i++) {
      const sample = getTenExamples('en');
      expect(sample).toHaveLength(10);
      expect(new Set(sample).size).toBe(10);
    }
  });
});
