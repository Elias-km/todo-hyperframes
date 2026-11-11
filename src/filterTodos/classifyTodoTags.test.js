import { describe, expect, it, vi } from 'vitest';
import { classifyTodoTags } from './classifyTodoTags.js';

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

describe('Clasificación de tarea manual', () => {
  it('envía solo el título y el catálogo fijo', async () => {
    const mock = modelResponse({ tags: ['hogar', 'limpieza'] });
    const tags = await classifyTodoTags({
      text: 'Limpiar ventanas',
      model: mock.model,
      language: 'es',
    });
    expect(tags).toEqual(['hogar', 'limpieza']);
    expect(mock.prompt.mock.calls[0][0]).toContain('Limpiar ventanas');
    expect(mock.prompt.mock.calls[0][0]).toContain('"id":"hogar"');
    expect(mock.destroy).toHaveBeenCalledOnce();
  });

  it('rechaza una respuesta sin categorías reconocidas', async () => {
    const mock = modelResponse({ tags: ['inventada'] });
    await expect(classifyTodoTags({ text: 'Tarea', model: mock.model }))
      .rejects.toThrow('No valid category returned');
  });
});
