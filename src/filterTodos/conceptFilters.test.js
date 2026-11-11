import { describe, expect, it } from 'vitest';
import { filterByConcepts, getVisibleConcepts } from './conceptFilters.js';
import { FILTER_CONCEPTS } from './filterCatalog.js';

const todos = [
  { id: '1', conceptIds: ['hogar', 'limpieza'] },
  { id: '2', conceptIds: ['hogar'] },
  { id: '3', conceptIds: ['compras'] },
  { id: '4', conceptIds: ['deporte'] },
];

describe('Filtros deterministas', () => {
  it('cuenta asociaciones sin consultar la IA', () => {
    const filters = getVisibleConcepts(todos, FILTER_CONCEPTS);
    expect(filters.find((f) => f.id === 'hogar').count).toBe(2);
    expect(filters.find((f) => f.id === 'compras').count).toBe(1);
  });

  it('combina categorías por OR', () => {
    expect(filterByConcepts(todos, new Set(['compras', 'hogar']))
      .map(({ id }) => id)).toEqual(['1', '2', '3']);
  });

  it('traduce las etiquetas sin volver a clasificar', () => {
    const filters = getVisibleConcepts(todos, FILTER_CONCEPTS, 'en');
    expect(filters.find((f) => f.id === 'hogar').label).toBe('Home');
  });
});
