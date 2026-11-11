// Catálogo estable y compartido por las tareas manuales y las generadas.
// Los identificadores son independientes del idioma visible.
const definitions = [
  ['hogar', 'Hogar', 'Home', '#0F766E'],
  ['limpieza', 'Limpieza', 'Cleaning', '#6D28D9'],
  ['compras', 'Compras', 'Shopping', '#B45309'],
  ['cocina', 'Cocina', 'Cooking', '#1D4ED8'],
  ['alimentacion', 'Alimentación', 'Food', '#BE185D'],
  ['trabajo', 'Trabajo', 'Work', '#4D7C0F'],
  ['estudios', 'Estudios', 'Studies', '#0E7490'],
  ['salud', 'Salud', 'Health', '#9F1239'],
  ['deporte', 'Deporte', 'Sports', '#5B21B6'],
  ['familia', 'Familia', 'Family', '#C2410C'],
  ['mascotas', 'Mascotas', 'Pets', '#166534'],
  ['finanzas', 'Finanzas', 'Finance', '#1E40AF'],
  ['tramites', 'Trámites', 'Paperwork', '#A21CAF'],
  ['transporte', 'Transporte', 'Transport', '#92400E'],
  ['vehiculos', 'Vehículos', 'Vehicles', '#155E75'],
  ['mantenimiento', 'Mantenimiento', 'Maintenance', '#9D174D'],
  ['bricolaje', 'Bricolaje', 'DIY', '#3F6212'],
  ['jardineria', 'Jardinería', 'Gardening', '#4338CA'],
  ['tecnologia', 'Tecnología', 'Technology', '#B91C1C'],
  ['organizacion', 'Organización', 'Organization', '#0D9488'],
  ['ocio', 'Ocio', 'Leisure', '#7E22CE'],
  ['viajes', 'Viajes', 'Travel', '#A16207'],
  ['lectura', 'Lectura', 'Reading', '#0369A1'],
  ['formacion', 'Formación', 'Learning', '#BE123C'],
  ['comunicacion', 'Comunicación', 'Communication', '#7F1D1D'],
  ['regalos', 'Regalos', 'Gifts', '#7C3AED'],
  ['ropa', 'Ropa', 'Clothing', '#C05621'],
  ['cuidado_personal', 'Cuidado personal', 'Personal care', '#701A75'],
  ['descanso', 'Descanso', 'Rest', '#6B21A8'],
  ['eventos', 'Eventos', 'Events', '#9A3412'],
  ['reciclaje', 'Reciclaje', 'Recycling', '#365314'],
  ['seguridad', 'Seguridad', 'Safety', '#1E3A8A'],
  ['creatividad', 'Creatividad', 'Creativity', '#831843'],
  ['productividad', 'Productividad', 'Productivity', '#0C4A6E'],
  ['amistades', 'Amistades', 'Friends', '#075985'],
  ['decoracion', 'Decoración', 'Decoration', '#854D0E'],
];

export const FILTER_CATALOG = definitions.map(([id, es, en, color]) => ({
  id, es, en, color,
}));

const ids = new Set(FILTER_CATALOG.map(({ id }) => id));

export const FILTER_CONCEPTS = Object.fromEntries(
  FILTER_CATALOG.map(({ id, es, en }) => [id, { es, en }])
);

export const FILTER_COLORS = Object.fromEntries(
  FILTER_CATALOG.map(({ id, color }) => [id, color])
);

export function sanitizeTags(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id) =>
    typeof id === 'string' && ids.has(id)
  ))].slice(0, 3);
}

export function catalogForPrompt() {
  return FILTER_CATALOG.map(({ id, es, en }) => ({ id, es, en }));
}
