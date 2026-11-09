import { describe, expect, it } from 'vitest';
import { createInitialState, todoReducer } from './todoReducer.js';

const first = { id: '1', text: 'Primera tarea' };
const second = { id: '2', text: 'Segunda tarea' };

const dispatch = (state, type, payload = {}) =>
  todoReducer(state, { type, ...payload });

describe('todoReducer', () => {
  it('inicializa correctamente el estado', () => {
    const state = createInitialState();

    expect(state.todos).toEqual([]);
    expect(state.selectedIds.size).toBe(0);
  });

  it('añade tareas y elimina espacios sobrantes', () => {
    const state = dispatch(createInitialState(), 'add', {
      id: '1',
      text: '  Primera tarea  ',
    });

    expect(state.todos).toEqual([first]);
  });

  it('rechaza tareas vacías', () => {
    const state = createInitialState();

    expect(dispatch(state, 'add', {
      id: '1',
      text: '   ',
    })).toBe(state);
  });

  it('selecciona y deselecciona tareas', () => {
    const initial = createInitialState([first]);
    const selected = dispatch(initial, 'toggle', { id: '1' });
    const cleared = dispatch(selected, 'toggle', { id: '1' });

    expect(selected.selectedIds.has('1')).toBe(true);
    expect(cleared.selectedIds.size).toBe(0);
    expect(initial.selectedIds.size).toBe(0);
  });

  it('elimina las tareas seleccionadas', () => {
    const initial = createInitialState([first, second]);
    const selected = dispatch(initial, 'toggle', { id: '1' });
    const result = dispatch(selected, 'removeSelected');

    expect(result.todos).toEqual([second]);
    expect(result.selectedIds.size).toBe(0);
  });

  it('elimina una tarea individual', () => {
    const state = createInitialState([first, second]);
    const result = dispatch(state, 'remove', { id: '1' });

    expect(result.todos).toEqual([second]);
  });

  it('permite deshacer y rehacer', () => {
    const initial = createInitialState();
    const added = dispatch(initial, 'add', first);
    const undone = dispatch(added, 'undo');
    const redone = dispatch(undone, 'redo');

    expect(undone.todos).toEqual([]);
    expect(redone.todos).toEqual([first]);
  });

  it('invalida redo después de una nueva modificación', () => {
    const initial = createInitialState();
    const added = dispatch(initial, 'add', first);
    const undone = dispatch(added, 'undo');
    const changed = dispatch(undone, 'add', second);

    expect(changed.future).toEqual([]);
  });
});

describe('Traducciones y Undo/Redo', () => {
  it('guarda traducciones sin sobrescribir el original ni crear historial', () => {
    const initial = createInitialState([
      { id: '1', text: 'Comprar pan' },
    ]);

    const result = todoReducer(initial, {
      type: 'cacheTranslations',
      sourceLanguage: 'es',
      targetLanguage: 'en',
      translations: {
        1: {
          sourceText: 'Comprar pan',
          text: 'Buy bread',
        },
      },
    });

    expect(result.todos[0]).toEqual({
      id: '1',
      text: 'Comprar pan',
      originalLanguage: 'es',
      translations: { en: 'Buy bread' },
    });

    expect(result.history).toHaveLength(0);
  });

  it('conserva traducciones después de deshacer y rehacer', () => {
    let state = createInitialState();

    state = todoReducer(state, {
      type: 'add', id: '1', text: 'Comprar pan', language: 'es',
    });

    state = todoReducer(state, {
      type: 'add', id: '2', text: 'Pasear al perro', language: 'es',
    });

    state = todoReducer(state, {
      type: 'cacheTranslations',
      sourceLanguage: 'es',
      targetLanguage: 'en',
      translations: {
        1: { sourceText: 'Comprar pan', text: 'Buy bread' },
        2: { sourceText: 'Pasear al perro', text: 'Walk the dog' },
      },
    });

    state = todoReducer(state, { type: 'undo' });

    expect(state.todos[0].translations.en).toBe('Buy bread');

    state = todoReducer(state, { type: 'redo' });

    expect(state.todos[1].translations.en).toBe('Walk the dog');
  });
});

describe('Migración del idioma original', () => {
  it('identifica tareas antiguas antes de cambiar de idioma', () => {
    const initial = createInitialState([
      { id: '1', text: 'Comprar pan' },
    ]);

    const result = todoReducer(initial, {
      type: 'tagOriginalLanguage',
      language: 'es',
    });

    expect(result.todos[0]).toEqual({
      id: '1',
      text: 'Comprar pan',
      originalLanguage: 'es',
    });

    expect(result.history).toHaveLength(0);
  });

  it('no modifica el idioma original de una tarea existente', () => {
    const initial = createInitialState([
      {
        id: '1',
        text: 'Buy bread',
        originalLanguage: 'en',
      },
    ]);

    const result = todoReducer(initial, {
      type: 'tagOriginalLanguage',
      language: 'es',
    });

    expect(result.todos[0].originalLanguage).toBe('en');
  });
});
