// Fixtures exclusivas de producción audiovisual. No se incorporan al código de la app.
// IDs, categorías y esquema contrastados con todo-hyperframes/main (2026-11-11).
const records = [
  ['Preparar la presentación del proyecto', 'Prepare the project presentation', ['trabajo', 'organizacion']],
  ['Revisar las prioridades de la semana', 'Review this week’s priorities', ['trabajo', 'productividad']],
  ['Enviar la propuesta al equipo', 'Send the proposal to the team', ['trabajo', 'comunicacion']],
  ['Organizar los documentos pendientes', 'Organize pending documents', ['trabajo', 'organizacion']],
  ['Comprar ingredientes para la cena', 'Buy ingredients for dinner', ['compras', 'alimentacion']],
  ['Preparar la comida del domingo', 'Prepare Sunday lunch', ['hogar', 'cocina', 'familia']],
  ['Regar las plantas del patio', 'Water the patio plants', ['hogar', 'jardineria']],
  ['Ordenar la habitación', 'Tidy up the bedroom', ['hogar', 'limpieza']],
  ['Salir a correr por la mañana', 'Go for a morning run', ['deporte', 'salud']],
  ['Reservar tiempo para descansar', 'Set aside time to rest', ['salud', 'descanso']],
  ['Planear una escapada de fin de semana', 'Plan a weekend getaway', ['viajes', 'ocio']],
  ['Comprar un regalo de cumpleaños', 'Buy a birthday gift', ['compras', 'regalos', 'familia']],
];

export const DEMO_TODOS = records.map(([es, en, conceptIds], index) => ({
  id: `promo-todo-${String(index + 1).padStart(3, '0')}`,
  text: es,
  originalLanguage: 'es',
  translations: { en },
  conceptIds,
  tagsVersion: 1,
}));

export function getSeed({ language = 'es', theme = 'light', todos = DEMO_TODOS } = {}) {
  if (!['es', 'en'].includes(language)) throw new Error(`Idioma no válido: ${language}`);
  if (!['light', 'dark', 'radioactive'].includes(theme)) throw new Error(`Tema no válido: ${theme}`);
  return {
    'todo-ia:todos': JSON.stringify({ version: 3, todos }),
    'todo-ia:language': language,
    'todo-ia:theme': theme,
  };
}
