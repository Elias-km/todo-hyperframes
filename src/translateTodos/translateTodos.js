import i18n from '../i18n/i18n.js';
import { runAiExclusive } from '../aiService/aiQueue.js';
import { isConfidentlyWrongLanguage } from '../aiService/verifyTaskLanguage.js';

const LANGUAGES = ['es', 'en'];

const LANGUAGE_NAMES = {
  es: { es: 'español', en: 'Spanish' },
  en: { es: 'inglés', en: 'English' },
};
const BATCH_SIZE = 8;

const responseSchema = {
  type: 'object',
  properties: {
    translations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          text: { type: 'string' },
        },
        required: ['id', 'text'],
        additionalProperties: false,
      },
    },
  },
  required: ['translations'],
  additionalProperties: false,
};

export function getDisplayedText(todo, language) {
  if (!todo.originalLanguage || todo.originalLanguage === language) {
    return todo.text;
  }

  return todo.translations?.[language] || todo.text;
}

export function getMissingTranslations(todos, sourceLanguage, targetLanguage) {
  return todos.filter((todo) => {
    const originalLanguage = todo.originalLanguage || sourceLanguage;

    return (
      originalLanguage !== targetLanguage &&
      !todo.translations?.[targetLanguage]
    );
  });
}

export async function translateTodos({
  todos,
  sourceLanguage,
  targetLanguage,
  model = globalThis.LanguageModel,
  signal,
}) {
  if (
    !LANGUAGES.includes(sourceLanguage) ||
    !LANGUAGES.includes(targetLanguage) ||
    sourceLanguage === targetLanguage
  ) {
    throw new Error('Unsupported language pair');
  }

  if (todos.length === 0) return {};

  if (
    typeof model?.availability !== 'function' ||
    typeof model?.create !== 'function'
  ) {
    throw new Error('Translation unavailable');
  }

  const options = {
    expectedInputs: [{
      type: 'text',
      languages: [sourceLanguage, targetLanguage],
    }],
    expectedOutputs: [{
      type: 'text',
      languages: [targetLanguage],
    }],
  };

  return runAiExclusive(async () => {
  // No iniciamos descargas adicionales al cambiar de idioma.
  if (await model.availability(options) !== 'available') {
    throw new Error('Translation unavailable');
  }

  const translations = {};

  for (let offset = 0; offset < todos.length; offset += BATCH_SIZE) {
    const batch = todos.slice(offset, offset + BATCH_SIZE);
    const session = await model.create(options);

    let sessionClosed = false;

    const abortSession = () => {
      if (sessionClosed) return;
      sessionClosed = true;
      session.destroy();
    };
    signal?.addEventListener('abort', abortSession, { once: true });

    try {
      if (signal?.aborted) {
        throw new DOMException('Operation cancelled', 'AbortError');
      }
      const prompt = i18n.getFixedT(
        targetLanguage,
        'prompts'
      )('translateTodos', {
        sourceLanguage: LANGUAGE_NAMES[sourceLanguage][targetLanguage],
        targetLanguage: LANGUAGE_NAMES[targetLanguage][targetLanguage],
        tasks: JSON.stringify(
          batch.map(({ id, text }) => ({ id, text }))
        ),
      });

      const result = await session.prompt(prompt, {
        responseConstraint: responseSchema,
        ...(signal ? { signal } : {}),
      });

      if (signal?.aborted) {
        throw new DOMException('Operation cancelled', 'AbortError');
      }

      const parsed = JSON.parse(result);
      const items = parsed?.translations;

      if (!Array.isArray(items) || items.length !== batch.length) {
        throw new Error('Incomplete translation');
      }

      const expectedIds = new Set(batch.map((todo) => todo.id));
      const receivedIds = new Set();

      for (const item of items) {
        if (
          !item ||
          !expectedIds.has(item.id) ||
          receivedIds.has(item.id) ||
          typeof item.text !== 'string' ||
          !item.text.trim() ||
          item.text.trim().length > 500
        ) {
          throw new Error('Invalid translation');
        }

        if (await isConfidentlyWrongLanguage(
          item.text.trim(),
          targetLanguage
        )) {
          throw new Error('Translation in wrong language');
        }

        receivedIds.add(item.id);
        translations[item.id] = {
          sourceText: batch.find((todo) => todo.id === item.id).text,
          text: item.text.trim(),
        };
      }
    } finally {
      signal?.removeEventListener('abort', abortSession);
      abortSession();
    }
  }

  return translations;
  }, { signal });
}
