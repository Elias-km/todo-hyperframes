import i18n from '../i18n/i18n.js';
import { createTaskSession } from '../aiService/aiService.js';
import { runAiExclusive } from '../aiService/aiQueue.js';
import { isConfidentlyWrongLanguage } from '../aiService/verifyTaskLanguage.js';
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

  return runAiExclusive(async () => {
    const session = await createTaskSession(language, model);

    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        const instructions = attempt === 0
          ? prompt
          : `${prompt}\n\n${language === 'en'
            ? 'Your previous response was in the wrong language. Write the new task ONLY in English.'
            : 'La respuesta anterior estaba en otro idioma. Escribe la nueva tarea SOLO en español.'}`;

        const result = await session.prompt(instructions, {
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

        if (await isConfidentlyWrongLanguage(text, language)) {
          if (attempt === 0) continue;
          throw new Error('Wrong generated language');
        }

        return text;
      }

      throw new Error('Wrong generated language');
    } finally {
      session.destroy();
    }
  });
}
