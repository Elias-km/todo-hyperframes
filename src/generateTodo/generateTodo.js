import i18n from '../i18n/i18n.js';
import { createTaskSession } from '../aiService/aiService.js';
import { runAiExclusive } from '../aiService/aiQueue.js';
import { isConfidentlyWrongLanguage } from '../aiService/verifyTaskLanguage.js';
import { catalogForPrompt, sanitizeTags } from '../filterTodos/filterCatalog.js';
import { getTenExamples } from './sampleExamples.js';
import { isRepeatedTask } from './generationGuard.js';

const schema = {
  type: 'object',
  properties: {
    text: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
  },
  required: ['text', 'tags'],
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
  if (!['es', 'en'].includes(language)) {
    throw new Error('Unsupported language');
  }

  const t = i18n.getFixedT(language, 'prompts');
  const categories = JSON.stringify(catalogForPrompt());

  return runAiExclusive(async () => {
    const session = await createTaskSession(language, model);

    try {
      let rejectedText = '';
      let rejectionReason = '';

      for (let attempt = 0; attempt < 2; attempt++) {
        // Diez muestras distintas por petición; el mazo evita repetir
        // muestras entre generaciones hasta agotar el catálogo.
        const shownExamples = getTenExamples(language);
        const prompt = t('generateTodo', {
          examples: shownExamples.join('\n'),
          categories,
        });

        const correction = !rejectedText ? '' :
          language === 'en'
            ? `\nPrevious task rejected (${rejectionReason}): ${JSON.stringify(rejectedText)}. Choose a DIFFERENT task and action.`
            : `\nTarea anterior rechazada (${rejectionReason}): ${JSON.stringify(rejectedText)}. Elige una tarea y acción DIFERENTES.`;

        const raw = await session.prompt(prompt + correction, {
          responseConstraint: schema,
        });
        const parsed = JSON.parse(raw);
        const text = parsed?.text?.trim();

        if (!text || text.length > 120) {
          throw new Error('Invalid generated task');
        }

        if (isRepeatedTask(text, existingTodos, shownExamples)) {
          rejectedText = text;
          rejectionReason = 'duplicate or copied example';
          continue;
        }

        if (await isConfidentlyWrongLanguage(text, language)) {
          rejectedText = text;
          rejectionReason = 'wrong language';
          continue;
        }

        return {
          text,
          conceptIds: sanitizeTags(parsed?.tags),
        };
      }

      throw new Error('Repeated or invalid generated task');
    } finally {
      session.destroy();
    }
  }, { priority: 'interactive' });
}
