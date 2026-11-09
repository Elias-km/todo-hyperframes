import { describe, expect, it, vi } from 'vitest';
import { loadTheme, saveTheme } from './theme.js';

describe('theme', () => {
  it('utiliza el tema claro por defecto', () => {
    expect(loadTheme({ getItem: () => null })).toBe('light');
  });

  it('recupera el tema oscuro', () => {
    expect(loadTheme({ getItem: () => 'dark' })).toBe('dark');
  });

  it('recupera el tema radioactivo', () => {
    expect(loadTheme({ getItem: () => 'radioactive' }))
      .toBe('radioactive');
  });

  it('descarta temas desconocidos', () => {
    expect(loadTheme({ getItem: () => 'unknown' })).toBe('light');
  });

  it('persiste correctamente el tema', () => {
    const storage = { setItem: vi.fn() };

    expect(saveTheme('radioactive', storage)).toBe(true);
    expect(storage.setItem).toHaveBeenCalledWith(
      'todo-ia:theme',
      'radioactive'
    );
  });
});
