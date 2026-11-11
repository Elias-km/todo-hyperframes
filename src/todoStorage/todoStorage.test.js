import { describe, expect, it, vi } from 'vitest';
import { loadTodos, saveTodos } from './todoStorage.js';

function memoryStorage(raw = null) {
  let value = raw;
  return {
    getItem: vi.fn(() => value),
    setItem: vi.fn((_, next) => { value = next; }),
  };
}

describe('Persistencia y migración a categorías fijas', () => {
  it('carga una lista vacía sin almacenamiento', () => {
    expect(loadTodos(memoryStorage())).toEqual([]);
  });

  it('migra un array antiguo preservando texto y traducciones', () => {
    const todo = {
      id: 'a', text: 'Regar plantas', originalLanguage: 'es',
      translations: { en: 'Water plants' },
      conceptIds: ['cuidado', 'plantas'],
    };
    const storage = memoryStorage(JSON.stringify([todo]));
    expect(loadTodos(storage)).toEqual([{
      id: 'a', text: 'Regar plantas', originalLanguage: 'es',
      translations: { en: 'Water plants' },
    }]);
    expect(saveTodos(loadTodos(storage), storage)).toBe(true);
    expect(JSON.parse(storage.getItem('todo-ia:todos')).version).toBe(3);
  });

  it('migra el objeto v2 sin considerar válidas etiquetas antiguas', () => {
    const storage = memoryStorage(JSON.stringify({
      version: 2,
      todos: [{ id: '1', text: 'Comprar', conceptIds: ['compras'] }],
      concepts: { compras: { es: 'Compras', en: 'Shopping' } },
      filterSignature: 'antigua',
    }));
    expect(loadTodos(storage)).toEqual([{ id: '1', text: 'Comprar' }]);
  });

  it('persiste etiquetas nuevas con su versión', () => {
    const todo = {
      id: '1', text: 'Limpiar ventanas',
      conceptIds: ['hogar', 'limpieza'], tagsVersion: 1,
    };
    const storage = memoryStorage();
    expect(saveTodos([todo], storage)).toBe(true);
    expect(loadTodos(storage)).toEqual([todo]);
  });

  it('descarta IDs de tareas repetidos y etiquetas desconocidas', () => {
    const storage = memoryStorage(JSON.stringify({
      version: 3,
      todos: [
        { id: '1', text: 'Tarea', tagsVersion: 1, conceptIds: ['hogar', 'falsa'] },
        { id: '1', text: 'Duplicada' },
        { id: '2', text: '   ' },
      ],
    }));
    expect(loadTodos(storage)).toEqual([{
      id: '1', text: 'Tarea', tagsVersion: 1, conceptIds: ['hogar'],
    }]);
  });

  it('tolera JSON corrupto y errores de almacenamiento', () => {
    expect(loadTodos(memoryStorage('{bad'))).toEqual([]);
    expect(saveTodos([], { setItem() { throw new Error('error'); } })).toBe(false);
  });

});
