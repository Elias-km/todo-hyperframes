
// Igualdad conservadora: solo consideramos equivalentes textos que,
// tras quitar artículos y normalizar imperativos/infinitivos simples,
// expresan esencialmente las mismas palabras. No hace IA ni fuzzy search.
function isPlantWatering(text) {
  if (typeof text !== 'string') return false;
  const normalized = text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  return /\b(?:regar|riega|riego|regando|water|watering)\b/.test(normalized) &&
    /\b(?:plantas?|plants?)\b/.test(normalized);
}


const ARTICLES = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'the', 'a', 'an',
]);

export function normalizeTaskTitle(value) {
  if (typeof value !== 'string') return '';

  const tokens = (value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase()
    .match(/[\p{L}\p{N}]+/gu) ?? [])
    .filter((part) => !ARTICLES.has(part));

  // "Lavar la ropa" y "Lava la ropa"; "Preparar" y "Prepara".
  if (tokens[0]?.length >= 5 && /(?:ar|er)$/.test(tokens[0])) {
    tokens[0] = tokens[0].slice(0, -1);
  }

  // Platos/plato, ventanas/ventana: diferencias morfológicas no crean tareas nuevas.
  for (let index = 1; index < tokens.length; index++) {
    if (tokens[index].length >= 5 && /[aeiou]s$/.test(tokens[index])) {
      tokens[index] = tokens[index].slice(0, -1);
    }
  }
  return tokens.join(' ');
}

export function isRepeatedTask(text, existingTodos = [], shownExamples = []) {
  const candidate = normalizeTaskTitle(text);
  if (!candidate) return false;

  // Solo las diez muestras mostradas y los títulos reales existentes.
  const references = [
    ...shownExamples,
    ...existingTodos.flatMap((todo) => [
      todo.text,
      ...Object.values(todo.translations ?? {}),
    ]),
  ];

  const wateringPlants = isPlantWatering(text);
  return references.some((reference) =>
    normalizeTaskTitle(reference) === candidate ||
    (wateringPlants && isPlantWatering(reference))
  );
}
