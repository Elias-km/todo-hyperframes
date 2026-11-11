// No se realiza ningún análisis con IA durante el renderizado.
// Solo contamos etiquetas ya guardadas en las tareas.
export function getVisibleConcepts(todos, concepts, language = 'es') {
  const counts = new Map();

  for (const todo of todos) {
    for (const id of new Set(todo.conceptIds ?? [])) {
      if (!Object.hasOwn(concepts, id)) continue;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }

  return [...counts].map(([id, count]) => ({
    id,
    count,
    label: concepts[id][language] ?? concepts[id].es,
  })).sort((a, b) =>
    b.count - a.count ||
    a.label.localeCompare(b.label, language)
  );
}

export function filterByConcepts(todos, selectedIds) {
  if (selectedIds.size === 0) return todos;
  return todos.filter((todo) =>
    todo.conceptIds?.some((id) => selectedIds.has(id))
  );
}
