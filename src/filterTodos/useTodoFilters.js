import { useMemo, useState } from 'react';
import {
  filterByConcepts,
  getVisibleConcepts,
} from './conceptFilters.js';
import { FILTER_COLORS } from './filterCatalog.js';

export default function useTodoFilters({ todos, concepts, language }) {
  const [selection, setSelection] = useState(() => ({
    all: true,
    ids: new Set(),
  }));

  const visibleFilters = useMemo(() =>
    todos.length >= 4
      ? getVisibleConcepts(todos, concepts, language).slice(0, 5)
      : [],
  [todos, concepts, language]);

  const availableIds = useMemo(
    () => new Set(visibleFilters.map(({ id }) => id)),
    [visibleFilters]
  );

  const selectedIds = useMemo(
    () => new Set([...selection.ids].filter((id) => availableIds.has(id))),
    [selection.ids, availableIds]
  );

  // Si una categoría deja de figurar entre las cinco principales,
  // tampoco debe mantener la lista oculta.
  const allSelected = selection.all || selectedIds.size === 0;

  const filteredTodos = useMemo(
    () => allSelected ? todos : filterByConcepts(todos, selectedIds),
    [allSelected, todos, selectedIds]
  );

  const colors = useMemo(() => Object.fromEntries(
    visibleFilters.map(({ id }) => [id, FILTER_COLORS[id]])
  ), [visibleFilters]);

  function toggle(id) {
    if (!availableIds.has(id)) return;
    setSelection((previous) => {
      const ids = new Set([...previous.ids].filter((item) => availableIds.has(item)));
      const showAll = previous.all || ids.size === 0;
      if (ids.has(id)) ids.delete(id);
      else ids.add(id);
      return { all: ids.size === 0 ? true : showAll, ids };
    });
  }

  function toggleAll() {
    setSelection((previous) => {
      const ids = new Set([...previous.ids].filter((id) => availableIds.has(id)));
      return {
        all: ids.size === 0 ? true : !previous.all,
        ids,
      };
    });
  }

  function clear() {
    setSelection((previous) => previous.all && previous.ids.size === 0
      ? previous : { all: true, ids: new Set() });
  }

  return {
    visibleFilters,
    selectedIds,
    allSelected,
    filteredTodos,
    colors,
    toggle,
    toggleAll,
    clear,
  };
}
