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
