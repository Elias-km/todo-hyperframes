import { describe, expect, it, vi } from 'vitest';
import { generateTodo } from './generateTodo.js';

function mockModel(text) {
  const destroy = vi.fn();

  const model = {
    create: vi.fn().mockResolvedValue({
      prompt: vi.fn().mockResolvedValue(
        JSON.stringify({ text })
      ),
      destroy,
    }),
  };

  return { model, destroy };
}

describe('generateTodo', () => {
  it('genera una tarea válida', async () => {
    const { model, destroy } = mockModel('Comprar pan');

    const result = await generateTodo({ model });

    expect(result).toBe('Comprar pan');
    expect(destroy).toHaveBeenCalledOnce();
  });

  it('utiliza el idioma seleccionado', async () => {
    const { model } = mockModel('Buy bread');

    await generateTodo({ language: 'en', model });

    expect(model.create).toHaveBeenCalledWith({
      expectedInputs: [
        { type: 'text', languages: ['en'] },
      ],
      expectedOutputs: [
        { type: 'text', languages: ['en'] },
      ],
    });
  });

  it('rechaza tareas duplicadas', async () => {
    const { model, destroy } = mockModel('Comprar pan');

    await expect(generateTodo({
      model,
      existingTodos: [{ id: '1', text: 'Comprar pan' }],
    })).rejects.toThrow('Duplicate generated task');

    expect(destroy).toHaveBeenCalledOnce();
  });

  it('rechaza una respuesta vacía', async () => {
    const { model } = mockModel(' ');

    await expect(generateTodo({ model }))
      .rejects.toThrow('Invalid generated task');
  });

  it('rechaza navegadores incompatibles', async () => {
    await expect(generateTodo({ model: null }))
      .rejects.toThrow('AI unavailable');
  });
});

describe('Prompts internacionalizados', () => {
  it.each([
    {
      language: 'es',
      expected: 'Genera exactamente una tarea',
      existing: 'Comprar pan',
      generated: 'Revisar el calendario',
    },
    {
      language: 'en',
      expected: 'Generate exactly one',
      existing: 'Buy bread',
      generated: 'Plan a picnic',
    },
  ])('utiliza el prompt $language', async ({
    language,
    expected,
    existing,
    generated,
  }) => {
    const prompt = vi.fn().mockResolvedValue(
      JSON.stringify({ text: generated })
    );

    const model = {
      create: vi.fn().mockResolvedValue({
        prompt,
        destroy: vi.fn(),
      }),
    };

    await generateTodo({
      language,
      existingTodos: [{ id: '1', text: existing }],
      model,
    });

    const instructions = prompt.mock.calls[0][0];

    expect(instructions).toContain(expected);
    expect(instructions).toContain(existing);
    expect(instructions).not.toContain('{{examples}}');
    expect(instructions).not.toContain('{{existing}}');
  });
});

describe('Corrección del idioma generado', () => {
  it('reintenta cuando detecta español en una tarea inglesa', async () => {
    const prompt = vi.fn()
      .mockResolvedValueOnce(JSON.stringify({
        text: 'Limpiar el coche',
      }))
      .mockResolvedValueOnce(JSON.stringify({
        text: 'Clean the car',
      }));

    const model = {
      create: vi.fn().mockResolvedValue({
        prompt,
        destroy: vi.fn(),
      }),
    };

    vi.stubGlobal('LanguageDetector', {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue({
        detect: vi.fn(async (text) => [{
          detectedLanguage: text === 'Limpiar el coche'
            ? 'es'
            : 'en',
          confidence: 0.99,
        }]),
        destroy: vi.fn(),
      }),
    });

    try {
      const result = await generateTodo({
        language: 'en',
        model,
      });

      expect(result).toBe('Clean the car');
      expect(prompt).toHaveBeenCalledTimes(2);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
