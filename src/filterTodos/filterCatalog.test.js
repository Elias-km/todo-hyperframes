import { describe, expect, it } from 'vitest';
import {
  FILTER_CATALOG,
  FILTER_COLORS,
  sanitizeTags,
} from './filterCatalog.js';

describe('Catálogo fijo', () => {
  it('contiene categorías con IDs y colores únicos', () => {
    expect(FILTER_CATALOG.length).toBeGreaterThanOrEqual(30);
    expect(new Set(FILTER_CATALOG.map(({ id }) => id)).size)
      .toBe(FILTER_CATALOG.length);
    expect(new Set(Object.values(FILTER_COLORS)).size)
      .toBe(FILTER_CATALOG.length);
  });

  it('descarta categorías inventadas y repetidas', () => {
    expect(sanitizeTags(['hogar', 'inventada', 'hogar', 'limpieza']))
      .toEqual(['hogar', 'limpieza']);
  });
});
