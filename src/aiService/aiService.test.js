import { describe, expect, it, vi } from 'vitest';
import {
  getPromptAvailability,
  downloadModel,
  prepareModel,
  createTaskSession,
  releasePreparedModel,
} from './aiService.js';

describe('AI service', () => {
  it('detecta un navegador incompatible', async () => {
    expect(await getPromptAvailability('es', null))
      .toBe('unavailable');
  });

  it.each([
    'available',
    'downloadable',
    'downloading',
    'unavailable',
  ])('reconoce el estado %s', async (status) => {
    const model = {
      availability: vi.fn().mockResolvedValue(status),
    };

    expect(await getPromptAvailability('es', model))
      .toBe(status);
  });

  it('comprueba el idioma solicitado', async () => {
    const model = {
      availability: vi.fn().mockResolvedValue('available'),
    };

    await getPromptAvailability('en', model);

    expect(model.availability).toHaveBeenCalledWith({
      expectedInputs: [{ type: 'text', languages: ['en'] }],
      expectedOutputs: [{ type: 'text', languages: ['en'] }],
    });
  });

  it('controla errores de disponibilidad', async () => {
    const model = {
      availability: vi.fn().mockRejectedValue(new Error('Failed')),
    };

    expect(await getPromptAvailability('es', model))
      .toBe('error');
  });

  it('descarga, informa del progreso y libera la sesión', async () => {
    const onProgress = vi.fn();
    const destroy = vi.fn();

    const model = {
      create: vi.fn(async (options) => {
        options.monitor({
          addEventListener(event, callback) {
            expect(event).toBe('downloadprogress');
            callback({ loaded: 0.45 });
          },
        });

        return { destroy };
      }),
    };

    await downloadModel('es', onProgress, model);

    expect(onProgress).toHaveBeenCalledWith(45);
    expect(destroy).not.toHaveBeenCalled();

    releasePreparedModel();
    await Promise.resolve();

    expect(destroy).toHaveBeenCalledOnce();
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedOutputs: [
          { type: 'text', languages: ['es'] },
        ],
      })
    );
  });

  it('rechaza una descarga sin API compatible', async () => {
    await expect(downloadModel('es', () => {}, null))
      .rejects.toThrow('AI unavailable');
  });
});


describe('Preparación y reutilización', () => {
  it('inicializa una sola vez y clona sesiones independientes', async () => {
    const cloneDestroy = vi.fn();

    const base = {
      clone: vi.fn().mockResolvedValue({
        destroy: cloneDestroy,
      }),
      destroy: vi.fn(),
    };

    const model = {
      create: vi.fn().mockResolvedValue(base),
    };

    const first = await prepareModel('es', () => {}, model);
    const second = await prepareModel('es', () => {}, model);

    expect(first).toBe(second);
    expect(model.create).toHaveBeenCalledTimes(1);

    const clone = await createTaskSession('es', model);

    expect(base.clone).toHaveBeenCalledOnce();

    clone.destroy();

    expect(cloneDestroy).toHaveBeenCalledOnce();
    expect(base.destroy).not.toHaveBeenCalled();

    releasePreparedModel();
    await Promise.resolve();

    expect(base.destroy).toHaveBeenCalledOnce();
  });
});

describe('Recuperación de sesiones', () => {
  it('reconstruye la sesión cuando falla la clonación', async () => {
    const model = {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn()
        .mockResolvedValueOnce({
          clone: vi.fn().mockRejectedValue(
            new Error('Session invalidated')
          ),
          destroy: vi.fn(),
        })
        .mockResolvedValueOnce({
          clone: vi.fn().mockResolvedValue({
            destroy: vi.fn(),
          }),
          destroy: vi.fn(),
        }),
    };

    const session = await createTaskSession('es', model);

    expect(model.create).toHaveBeenCalledTimes(2);
    expect(session).toBeDefined();

    session.destroy();
    releasePreparedModel();
  });
});
