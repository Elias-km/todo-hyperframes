import { describe, expect, it } from 'vitest';
import { completeTaskTags } from './taskTagRules.js';

describe('Relaciones domésticas de etiquetas', () => {
  it('incluye Hogar y Limpieza al lavar los platos', () => {
    expect(completeTaskTags('Lavar los platos después de la cena', ['limpieza']))
      .toEqual(['hogar', 'limpieza']);
  });

  it('incluye Hogar y Jardinería al regar las plantas', () => {
    expect(completeTaskTags('Regar la planta en maceta', ['jardineria']))
      .toEqual(['hogar', 'jardineria']);
  });

  it('funciona en inglés', () => {
    expect(completeTaskTags('Water the plants', ['jardineria']))
      .toEqual(['hogar', 'jardineria']);
    expect(completeTaskTags('Wash the dishes', ['limpieza']))
      .toEqual(['hogar', 'limpieza']);
  });

  it('no considera doméstica la compra de plantas ni una tarea digital', () => {
    expect(completeTaskTags('Comprar plantas', ['compras'])).toEqual(['compras']);
    expect(completeTaskTags('Limpiar la base de datos', ['tecnologia']))
      .toEqual(['tecnologia']);
  });

  it('no atribuye Hogar a trabajos explícitamente públicos', () => {
    expect(completeTaskTags('Regar las plantas del parque', ['jardineria']))
      .toEqual(['jardineria']);
    expect(completeTaskTags('Limpiar la cocina del restaurante', ['limpieza']))
      .toEqual(['limpieza']);
  });

  it('no sustituye a la clasificación IA cuando no existe', () => {
    expect(completeTaskTags('Lavar platos', [])).toEqual([]);
  });

  it('respeta el máximo de tres categorías y elimina duplicados', () => {
    expect(completeTaskTags('Regar las plantas', [
      'jardineria', 'jardineria', 'ocio', 'mantenimiento',
    ])).toEqual(['hogar', 'jardineria', 'ocio']);
  });
});
