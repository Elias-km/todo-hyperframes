import i18n from '../i18n/i18n.js';
import { createTaskSession } from '../aiService/aiService.js';
import { examples } from './examples.js';

const LANGUAGE_INDEX = {
  es: 0,
  en: 1,
};

const schema = {
  type: 'object',
  properties: {
    text: { type: 'string' },
  },
  required: ['text'],
  additionalProperties: false,
};

export async function generateTodo({
  language = 'es',
  existingTodos = [],
  model = globalThis.LanguageModel,
}) {
  if (typeof model?.create !== 'function') {
    throw new Error('AI unavailable');
  }

  if (!Object.hasOwn(LANGUAGE_INDEX, language)) {
    throw new Error('Unsupported language');
  }

  const index = LANGUAGE_INDEX[language];

  const sample = [...examples]
    .sort(() => Math.random() - 0.5)
    .slice(0, 12)
    .map((item) => item[index]);

  const existing = existingTodos.map((todo) => todo.text);

  const t = i18n.getFixedT(language, 'prompts');

  const prompt = t('generateTodo', {
    examples: sample.join('\n'),
    existing: JSON.stringify(existing),
  });

  const session = await createTaskSession(language, model);

  try {
    const result = await session.prompt(prompt, {
      responseConstraint: schema,
    });

    const text = JSON.parse(result).text?.trim();

    if (!text || text.length > 120) {
      throw new Error('Invalid generated task');
    }

    if (existing.some((item) =>
      item.toLocaleLowerCase(language) ===
      text.toLocaleLowerCase(language)
    )) {
      throw new Error('Duplicate generated task');
    }

    return text;
  } finally {
    session.destroy();
  }
}
