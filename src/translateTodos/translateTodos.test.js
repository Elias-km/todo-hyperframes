import { describe, expect, it, vi } from 'vitest';
import {
  getDisplayedText,
  getMissingTranslations,
  translateTodos,
} from './translateTodos.js';

describe('Traducción local de tareas', () => {
  const original = {
    id: '1',
    text: 'Comprar pan',
    originalLanguage: 'es',
  };

  it('conserva el original y utiliza la traducción disponible', () => {
    const todo = {
      ...original,
      translations: { en: 'Buy bread' },
    };

    expect(getDisplayedText(todo, 'es')).toBe('Comprar pan');
    expect(getDisplayedText(todo, 'en')).toBe('Buy bread');

    expect(getMissingTranslations(
      [todo], 'es', 'en'
    )).toEqual([]);
  });

  it('identifica únicamente las traducciones pendientes', () => {
    const todos = [
      original,
      { id: '2', text: 'Lavar coche', originalLanguage: 'es' },
      {
        id: '3',
        text: 'Walk the dog',
        originalLanguage: 'en',
      },
    ];

    expect(
      getMissingTranslations(todos, 'es', 'en').map((todo) => todo.id)
    ).toEqual(['1', '2']);
  });

  it('traduce mediante el modelo local y libera la sesión', async () => {
    const session = {
      prompt: vi.fn().mockResolvedValue(JSON.stringify({
        translations: [
          { id: '1', text: 'Buy bread' },
        ],
      })),
      destroy: vi.fn(),
    };

    const model = {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue(session),
    };

    const result = await translateTodos({
      todos: [original],
      sourceLanguage: 'es',
      targetLanguage: 'en',
      model,
    });

    expect(result).toEqual({
      1: {
        sourceText: 'Comprar pan',
        text: 'Buy bread',
      },
    });

    expect(model.create).toHaveBeenCalledOnce();
    expect(session.destroy).toHaveBeenCalledOnce();
    expect(original.text).toBe('Comprar pan');
  });

  it('no descarga ningún modelo si no está disponible', async () => {
    const model = {
      availability: vi.fn().mockResolvedValue('downloadable'),
      create: vi.fn(),
    };

    await expect(translateTodos({
      todos: [original],
      sourceLanguage: 'es',
      targetLanguage: 'en',
      model,
    })).rejects.toThrow('Translation unavailable');

    expect(model.create).not.toHaveBeenCalled();
  });

  it('rechaza traducciones incompletas', async () => {
    const session = {
      prompt: vi.fn().mockResolvedValue(JSON.stringify({
        translations: [],
      })),
      destroy: vi.fn(),
    };

    const model = {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue(session),
    };

    await expect(translateTodos({
      todos: [original],
      sourceLanguage: 'es',
      targetLanguage: 'en',
      model,
    })).rejects.toThrow('Incomplete translation');

    expect(session.destroy).toHaveBeenCalledOnce();
  });
});

describe('Idioma de las instrucciones de traducción', () => {
  it('utiliza el idioma de destino para construir el prompt', async () => {
    const prompt = vi.fn().mockResolvedValue(JSON.stringify({
      translations: [{
        id: '1',
        text: 'Buy bread',
      }],
    }));

    const model = {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue({
        prompt,
        destroy: vi.fn(),
      }),
    };

    await translateTodos({
      todos: [{ id: '1', text: 'Comprar pan' }],
      sourceLanguage: 'es',
      targetLanguage: 'en',
      model,
    });

    expect(prompt.mock.calls[0][0]).toContain(
      'Translate the following tasks from Spanish to English'
    );
  });
});
