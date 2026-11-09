// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App.jsx';
import { loadTodos } from '../../src/todoStorage/todoStorage.js';

const initialTodos = [
  { id: '1', text: 'Plan my week' },
  { id: '2', text: 'Buy groceries' },
];

beforeEach(() => {
  localStorage.clear();

  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  vi.stubGlobal('crypto', { randomUUID: () => 'new-task-id' });

  // Simulamos las APIs nativas de dialog no implementadas por jsdom.
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };

  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function setup() {
  const user = userEvent.setup();
  render(<App initialTodos={initialTodos} />);
  return user;
}

async function openForm(user) {
  const card = screen.getByRole('region', {
    name: 'ToDo IA',
  });

  await user.click(within(card).getByRole('button', { name: 'AÑADIR' }));

  return screen.getByRole('dialog');
}

describe('App - integración', () => {
  it('muestra las tareas iniciales y las guarda', () => {
    setup();

    expect(screen.getByRole('button', {
      name: 'Plan my week',
    })).toBeTruthy();

    expect(screen.getByRole('button', {
      name: 'Buy groceries',
    })).toBeTruthy();

    expect(screen.getByRole('button', {
      name: 'ELIMINAR',
    }).disabled).toBe(true);

    expect(loadTodos()).toEqual(initialTodos);
  });

  it('rechaza textos vacíos y permite añadir tareas', async () => {
    const user = setup();
    const dialog = await openForm(user);
    const input = within(dialog).getByRole('textbox');

    expect(document.activeElement).toBe(input);

    await user.type(input, '   ');
    await user.click(within(dialog).getByRole('button', {
      name: 'AÑADIR',
    }));

    expect(screen.getAllByRole('listitem')).toHaveLength(2);

    await user.clear(input);
    await user.type(input, 'Nueva tarea{Enter}');

    expect(screen.getByRole('button', {
      name: 'Nueva tarea',
    })).toBeTruthy();

    expect(loadTodos().map((todo) => todo.text)).toEqual([
      'Plan my week',
      'Buy groceries',
      'Nueva tarea',
    ]);
  });

  it('selecciona, elimina, deshace y rehace', async () => {
    const user = setup();

    await user.click(screen.getByRole('button', {
      name: 'Plan my week',
    }));

    await user.click(screen.getByRole('button', {
      name: 'Buy groceries',
    }));

    expect(screen.getByRole('button', {
      name: 'Plan my week',
    }).getAttribute('aria-pressed')).toBe('true');

    await user.click(screen.getByRole('button', {
      name: 'ELIMINAR',
    }));

    expect(screen.queryAllByRole('listitem')).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'Deshacer' }));

    expect(screen.getAllByRole('listitem')).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Rehacer' }));

    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(loadTodos()).toEqual([]);
  });

  it('elimina una tarea mediante doble clic', async () => {
    const user = setup();

    await user.dblClick(screen.getByRole('button', {
      name: 'Plan my week',
    }));

    expect(screen.queryByRole('button', {
      name: 'Plan my week',
    })).toBeNull();

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('cancela el formulario sin añadir tareas', async () => {
    const user = setup();
    const dialog = await openForm(user);

    await user.type(within(dialog).getByRole('textbox'), 'Descartada');

    await user.click(within(dialog).getByRole('button', {
      name: 'CANCELAR',
    }));

    expect(dialog.open).toBe(false);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(loadTodos()).toEqual(initialTodos);
  });
});

describe('Theme - integración', () => {
  it('alterna Claro, Oscuro, Radioactivo y Claro', async () => {
    const user = setup();

    await user.click(screen.getByRole('button', {
      name: 'Cambiar al tema oscuro',
    }));

    expect(document.documentElement.dataset.theme).toBe('dark');

    await user.click(screen.getByRole('button', {
      name: 'Cambiar al tema radioactivo',
    }));

    expect(document.documentElement.dataset.theme).toBe('radioactive');

    await user.click(screen.getByRole('button', {
      name: 'Cambiar al tema claro',
    }));

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('todo-ia:theme')).toBe('light');
  });

  it('recupera el último tema seleccionado', () => {
    localStorage.setItem('todo-ia:theme', 'radioactive');
    setup();

    expect(document.documentElement.dataset.theme).toBe('radioactive');

    expect(screen.getByRole('button', {
      name: 'Cambiar al tema claro',
    })).toBeTruthy();
  });
});
