import { describe, expect, it, vi } from 'vitest';
import { generateTodo } from './generateTodo.js';

function modelResponse(value) {
  const prompt = vi.fn().mockResolvedValue(JSON.stringify(value));
  const destroy = vi.fn();
  return {
    prompt,
    destroy,
    model: {
      create: vi.fn().mockResolvedValue({
        clone: vi.fn().mockResolvedValue({ prompt, destroy }),
        destroy: vi.fn(),
      }),
    },
  };
}

describe('Generación de tareas con catálogo fijo', () => {
  it('devuelve título y etiquetas en una sola petición', async () => {
    const mock = modelResponse({
      text: 'Comprar pan',
      tags: ['compras', 'alimentacion'],
    });
    const result = await generateTodo({ model: mock.model });
    expect(result).toEqual({
      text: 'Comprar pan',
      conceptIds: ['compras', 'alimentacion'],
    });
    expect(mock.prompt).toHaveBeenCalledOnce();
    expect(mock.destroy).toHaveBeenCalledOnce();
  });

  it('utiliza diez ejemplos y no envía las tareas existentes', async () => {
    const mock = modelResponse({ text: 'Comprobar la cerradura del altillo', tags: ['hogar'] });
    await generateTodo({
      model: mock.model,
      // Ignorado deliberadamente por compatibilidad de llamadas antiguas.
      existingTodos: [{ id: '1', text: 'TextoSecreto123' }],
    });
    const prompt = mock.prompt.mock.calls[0][0];
    expect(prompt).not.toContain('TextoSecreto123');
    expect(prompt).toContain('"id":"hogar"');
    const examples = prompt.split('Diez ejemplos aleatorios:\n')[1]
      .split('\n\nCatálogo fijo')[0]
      .split('\n');
    expect(examples).toHaveLength(10);
    expect(new Set(examples).size).toBe(10);
  });

  it('rechaza localmente una tarea repetida sin enviar la lista al modelo', async () => {
    const mock = modelResponse({ text: 'Comprar pan', tags: ['compras'] });
    await expect(generateTodo({
      model: mock.model,
      existingTodos: [{ id: '1', text: 'Comprar pan' }],
    })).rejects.toThrow('Repeated or invalid generated task');
  });

  it('conserva el título si las etiquetas son inválidas', async () => {
    const mock = modelResponse({ text: 'Comprar pan', tags: ['inexistente'] });
    await expect(generateTodo({ model: mock.model }))
      .resolves.toEqual({ text: 'Comprar pan', conceptIds: [] });
  });

  it('rechaza navegadores incompatibles', async () => {
    await expect(generateTodo({ model: null })).rejects.toThrow('AI unavailable');
  });
});
