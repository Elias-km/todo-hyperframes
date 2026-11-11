import { examples } from './examples.js';

const SAMPLE_COUNT = 10;
let remaining = [];

function shuffledIndices(excluded) {
  const indices = Array.from(
    { length: examples.length },
    (_, index) => index
  ).filter((index) => !excluded.has(index));

  for (let index = indices.length - 1; index > 0; index--) {
    const random = Math.floor(Math.random() * (index + 1));
    [indices[index], indices[random]] = [indices[random], indices[index]];
  }

  return indices;
}

export function getTenExamples(language) {
  const languageIndex = language === 'en' ? 1 : 0;

  if (examples.length < SAMPLE_COUNT) {
    throw new Error('Not enough example tasks');
  }

  const selected = [];
  const selectedIndices = new Set();

  while (selected.length < SAMPLE_COUNT) {
    if (remaining.length === 0) {
      remaining = shuffledIndices(selectedIndices);
    }

    const index = remaining.pop();

    if (selectedIndices.has(index)) continue;
    selectedIndices.add(index);
    selected.push(examples[index][languageIndex]);
  }

  return selected;
}
