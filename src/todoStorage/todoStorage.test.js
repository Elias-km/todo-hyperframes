
import { describe, it, expect, vi } from 'vitest';
import { loadTodos, saveTodos } from './todoStorage.js';

const createStorage = (value) => ({
  getItem: vi.fn(() => value),
  setItem: vi.fn(),
});

describe('todoStorage', () => {
  it('devuelve una lista vacía cuando no hay datos', () => {
    expect(loadTodos(createStorage(null))).toEqual([]);
  });

  it('recupera las tareas guardadas', () => {
    const todos = [{ id: '1', text: 'Comprar pan' }];
    const storage = createStorage(JSON.stringify(todos));

    expect(loadTodos(storage)).toEqual(todos);
  });

  it('tolera JSON corrupto', () => {
    expect(loadTodos(createStorage('{invalid'))).toEqual([]);
  });

  it('descarta datos inválidos', () => {
    const storage = createStorage(JSON.stringify([
      { id: '1', text: 'Válida' },
      { id: '2', text: '  ' },
      { id: '3', text: 123 },
      null,
    ]));

    expect(loadTodos(storage)).toEqual([
      { id: '1', text: 'Válida' },
    ]);
  });

  it('descarta identificadores duplicados', () => {
    const storage = createStorage(JSON.stringify([
      { id: '1', text: 'Primera' },
      { id: '1', text: 'Duplicada' },
    ]));

    expect(loadTodos(storage)).toHaveLength(1);
  });

  it('guarda las tareas correctamente', () => {
    const storage = createStorage(null);
    const todos = [{ id: '1', text: 'Tarea' }];

    expect(saveTodos(todos, storage)).toBe(true);
    expect(storage.setItem).toHaveBeenCalledWith(
      'todo-react:todos',
      JSON.stringify(todos)
    );
  });

  it('tolera errores de lectura', () => {
    const storage = {
      getItem: () => { throw new Error('Storage error'); },
    };

    expect(loadTodos(storage)).toEqual([]);
  });

  it('tolera errores de escritura', () => {
    const storage = {
      setItem: () => { throw new Error('Storage error'); },
    };

    expect(saveTodos([], storage)).toBe(false);
  });
});
