import { describe, expect, it, vi } from 'vitest';
import { isConfidentlyWrongLanguage } from './verifyTaskLanguage.js';

describe('Validación local del idioma', () => {
  it('detecta una tarea claramente española solicitada en inglés', async () => {
    const destroy = vi.fn();

    const api = {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue({
        detect: vi.fn().mockResolvedValue([{
          detectedLanguage: 'es',
          confidence: 0.99,
        }]),
        destroy,
      }),
    };

    expect(await isConfidentlyWrongLanguage(
      'Limpiar el coche',
      'en',
      api
    )).toBe(true);

    expect(destroy).toHaveBeenCalledOnce();
  });

  it('no fuerza descargas ni rechaza frases demasiado breves', async () => {
    const api = {
      availability: vi.fn().mockResolvedValue('downloadable'),
      create: vi.fn(),
    };

    expect(await isConfidentlyWrongLanguage(
      'Comprar pan hoy',
      'en',
      api
    )).toBe(false);

    expect(api.create).not.toHaveBeenCalled();

    expect(await isConfidentlyWrongLanguage(
      'Pan',
      'en',
      api
    )).toBe(false);
  });
});
