import { describe, expect, it, vi } from 'vitest';
import { loadTheme, saveTheme } from './theme.js';

describe('theme', () => {
  it('utiliza el tema radioactivo por defecto', () => {
    expect(loadTheme({ getItem: () => null })).toBe('radioactive');
  });

  it('recupera el tema oscuro', () => {
    expect(loadTheme({ getItem: () => 'dark' })).toBe('dark');
  });

  it('recupera el tema radioactivo', () => {
    expect(loadTheme({ getItem: () => 'radioactive' }))
      .toBe('radioactive');
  });

  it('descarta temas desconocidos', () => {
    expect(loadTheme({ getItem: () => 'unknown' })).toBe('radioactive');
  });

  it('persiste correctamente el tema', () => {
    const storage = { setItem: vi.fn() };

    expect(saveTheme('radioactive', storage)).toBe(true);
    expect(storage.setItem).toHaveBeenCalledWith(
      'todo-react:theme',
      'radioactive'
    );
  });
});
