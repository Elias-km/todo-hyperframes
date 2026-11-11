import { describe, expect, it, vi } from 'vitest';
import { generateTodo } from './generateTodo.js';

// El mock devuelve una muestra realmente presente en la petición.
vi.mock('./sampleExamples.js', () => ({
  getTenExamples: () => [
    'Regar las plantas', 'Limpiar alfombras',
    'Preparar el botiquín', 'Organizar el correo',
    'Revisar la persiana', 'Colocar los zapatos',
    'Ordenar las facturas', 'Preparar la mochila',
    'Revisar las ventanas', 'Cuidar las flores',
  ],
}));

function mockModel(...responses) {
  const prompt = vi.fn();
  for (const response of responses) {
    prompt.mockResolvedValueOnce(JSON.stringify(response));
  }
  const model = {
    create: vi.fn().mockResolvedValue({
      clone: vi.fn().mockResolvedValue({ prompt, destroy: vi.fn() }),
      destroy: vi.fn(),
    }),
  };
  return { model, prompt };
}

describe('Generación diversa con diez ejemplos', () => {
  it('reintenta al copiar una muestra sin enviar tareas existentes', async () => {
    const { model, prompt } = mockModel(
      { text: 'Regar las plantas', tags: ['jardineria'] },
      { text: 'Ajustar las bisagras de la persiana', tags: ['bricolaje'] },
    );
    const result = await generateTodo({
      model,
      existingTodos: [{ id: '1', text: 'TextoPrivadoQueNoDebeEnviarse' }],
    });
    expect(result.text).toBe('Ajustar las bisagras de la persiana');
    expect(prompt).toHaveBeenCalledTimes(2);
    expect(prompt.mock.calls[0][0]).not.toContain('TextoPrivadoQueNoDebeEnviarse');
    expect(prompt.mock.calls[1][0]).not.toContain('TextoPrivadoQueNoDebeEnviarse');
  });

  it('reintenta ante duplicados de tareas almacenadas', async () => {
    const { model, prompt } = mockModel(
      { text: 'Lava la ropa', tags: ['ropa'] },
      { text: 'Revisar el estado del enchufe exterior', tags: ['mantenimiento'] },
    );
    const result = await generateTodo({
      model,
      existingTodos: [{ id: '1', text: 'Lavar la ropa' }],
    });
    expect(result.text).toBe('Revisar el estado del enchufe exterior');
    expect(prompt).toHaveBeenCalledTimes(2);
  });
});
