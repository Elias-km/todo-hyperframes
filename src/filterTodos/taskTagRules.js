import { sanitizeTags } from './filterCatalog.js';

// Complemento determinista, muy conservador, de los IDs elegidos por la IA.
// Solo se aplica a contextos domésticos inequívocos; nunca infiere etiquetas
// generales a partir de una única palabra como «plantas» o «trabajo».
function normalized(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

const domesticObjects = /\b(?:platos?|vajilla|cubiertos?|cocina|kitchen|dishes?|plates?|laundry|ropa|colada|armarios?|wardrobe|muebles?|furniture|ventanas?|windows?|suelos?|floors?|banos?|bathrooms?|dormitorios?|bedrooms?|habitaciones?|rooms?|salon|living room|casa|home|hogar|patio|balcon|terraza|sofa|camas?|beds?)\b/;
const cleaningActions = /\b(?:lavar|lava|lavo|lavando|fregar|friega|fregando|limpiar|limpia|limpiando|wash|washing|clean|cleaning|scrub|scrubbing|wiping|dusting)\b/;
const dishObjects = /\b(?:platos?|vajilla|cubiertos?|dishes?|plates?)\b/;
const gardeningActions = /\b(?:regar|riega|riego|regando|trasplantar|trasplanta|podar|poda|abonar|abona|water|watering|repot|repotting|prune|pruning)\b/;
const plantObjects = /\b(?:plantas?|macetas?|plant|plants|potted|flowerpots?)\b/;
const nonDomesticContext = /\b(?:restaurante|oficina|empresa|colegio|escuela|instituto|parque|municipal|hotel|restaurant|office|school|park|workplace)\b/;

export function completeTaskTags(text, suggestedTags) {
  const suggested = sanitizeTags(suggestedTags);
  // Si la IA no devolvió etiquetas válidas, conservamos el estado pendiente.
  if (suggested.length === 0) return [];

  const title = normalized(text);
  const domestic = domesticObjects.test(title);
  const dishes = dishObjects.test(title);
  const cleaning = cleaningActions.test(title) && (domestic || dishes);
  const gardening = gardeningActions.test(title) && plantObjects.test(title);

  const required = [];
  if ((domestic || gardening) && !nonDomesticContext.test(title)) required.push('hogar');
  if (cleaning) required.push('limpieza');
  if (gardening) required.push('jardineria');

  // Cuando hay tres etiquetas, las asociaciones domésticas inequívocas
  // prevalecen sobre etiquetas opcionales propuestas por el modelo.
  return [...new Set([...required, ...suggested])].slice(0, 3);
}
