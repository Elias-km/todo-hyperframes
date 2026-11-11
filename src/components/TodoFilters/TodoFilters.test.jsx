// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { changeLanguage } from '../../i18n/i18n.js';
import TodoFilters from './TodoFilters.jsx';

const filters = [{ id: 'hogar', count: 2, label: 'Hogar' }];

function renderFilters(items = filters, todoCount = 4) {
  return render(<TodoFilters
    filters={items}
    todoCount={todoCount}
    selectedIds={new Set()}
    colors={{ hogar: '#0F766E' }}
    allSelected
    onToggle={vi.fn()}
    onToggleAll={vi.fn()}
  />);
}

afterEach(() => {
  cleanup();
});

describe('Panel de filtros de IA', () => {
  it('muestra el icono, el texto y los botones anteriores', async () => {
    await changeLanguage('es');
    const { container } = renderFilters();

    expect(screen.getByText('Filtros inteligentes')).toBeTruthy();
    expect(screen.getByText('La IA local clasifica automáticamente tus tareas.')).toBeTruthy();
    expect(container.querySelector('[data-ai-filter-icon]')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Todos' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Hogar: 2' })).toBeTruthy();
  });

  it('muestra el panel también en inglés', async () => {
    await changeLanguage('en');
    renderFilters([{ id: 'hogar', count: 2, label: 'Home' }]);

    expect(screen.getByText('Smart filters')).toBeTruthy();
    expect(screen.getByText('Local AI automatically categorizes your tasks.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'All' })).toBeTruthy();
    await changeLanguage('es');
  });

  it('muestra el contador antes de alcanzar cuatro tareas', async () => {
    await changeLanguage('es');
    const { container } = renderFilters([], 2);
    expect(screen.getByText('Añade 2 tareas más para activar los filtros.')).toBeTruthy();
    expect(container.querySelector('[data-ai-filter-icon]')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Todos' })).toBeNull();
  });

  it('usa el singular cuando falta una tarea', async () => {
    await changeLanguage('es');
    renderFilters([], 3);
    expect(screen.getByText('Añade 1 tarea más para activar los filtros.')).toBeTruthy();
  });

  it('informa de que falta el etiquetado con cuatro tareas', async () => {
    await changeLanguage('es');
    renderFilters([], 4);
    expect(screen.getByText('Los filtros aparecerán cuando la IA haya clasificado las tareas.')).toBeTruthy();
  });

  it('traduce el contador al inglés', async () => {
    await changeLanguage('en');
    renderFilters([], 3);
    expect(screen.getByText('Add 1 more task to enable filters.')).toBeTruthy();
    await changeLanguage('es');
  });
});
