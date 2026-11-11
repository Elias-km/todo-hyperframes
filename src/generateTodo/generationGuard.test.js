import { describe, expect, it } from 'vitest';
import {
  normalizeTaskTitle,
  isRepeatedTask,
} from './generationGuard.js';

describe('Prevención de repeticiones sin IA', () => {
  it('detecta lavar/lava y puntuación', () => {
    expect(normalizeTaskTitle('Lava la ropa.')).toBe(
      normalizeTaskTitle('Lavar la ropa')
    );
    expect(normalizeTaskTitle('Lava los platos después de la cena.')).toBe(
      normalizeTaskTitle('Lavar los platos después de la cena')
    );
  });

  it('detecta copias de las muestras incluidas en el prompt', () => {
    expect(isRepeatedTask('Regar las plantas', [], ['Regar las plantas'])).toBe(true);
    expect(isRepeatedTask('Regar las plantas', [], ['Preparar el botiquín'])).toBe(false);
  });

  it('detecta duplicados locales sin enviar tareas al modelo', () => {
    expect(isRepeatedTask('Lava la ropa', [
      { text: 'Lavar la ropa' },
    ])).toBe(true);
  });

  it('no confunde un caso más específico con un duplicado exacto', () => {
    expect(isRepeatedTask('Prepara el desayuno del niño', [
      { text: 'Preparar el desayuno' },
    ])).toBe(false);
  });
});

describe('Repetición por misma intención de riego de plantas', () => {
  it('normaliza plurales corrientes sin utilizar la IA', () => {
    expect(normalizeTaskTitle('Lavar los platos'))
      .toBe(normalizeTaskTitle('Lava el plato'));
  });
  it('rechaza una segunda forma equivalente en la lista', () => {
    expect(isRepeatedTask('Regar las plantas', [
      { text: 'Regar la planta en maceta' },
    ])).toBe(true);
  });
  it('no rechaza regar otra cosa', () => {
    expect(isRepeatedTask('Regar el césped', [
      { text: 'Regar la planta en maceta' },
    ])).toBe(false);
  });
});


describe('Detección local de riego equivalente', () => {
  it('reconoce singular, plural y recipiente en español', () => {
    expect(isRepeatedTask('Regar las plantas', [
      { text: 'Regar la planta en maceta' },
    ])).toBe(true);
  });

  it('reconoce variantes inglesas', () => {
    expect(isRepeatedTask('Water the potted plants', [
      { text: 'Water plants' },
    ])).toBe(true);
  });

  it('no confunde regar el césped ni comprar plantas', () => {
    expect(isRepeatedTask('Regar el césped', [
      { text: 'Regar las plantas' },
    ])).toBe(false);
    expect(isRepeatedTask('Comprar plantas', [
      { text: 'Regar las plantas' },
    ])).toBe(false);
  });
});
