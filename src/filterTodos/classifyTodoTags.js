import i18n from '../i18n/i18n.js';
import { createTaskSession } from '../aiService/aiService.js';
import { runAiExclusive } from '../aiService/aiQueue.js';
import { catalogForPrompt, sanitizeTags } from './filterCatalog.js';

const responseSchema = {
  type: 'object',
  properties: {
    tags: { type: 'array', items: { type: 'string' } },
  },
  required: ['tags'],
  additionalProperties: false,
};

export async function classifyTodoTags({
  text,
  language = 'es',
  model = globalThis.LanguageModel,
  signal,
  onPreempt,
}) {
  if (!['es', 'en'].includes(language) ||
      typeof text !== 'string' || !text.trim() ||
      typeof model?.create !== 'function') {
    throw new Error('Task classification unavailable');
  }

  const prompt = i18n.getFixedT(language, 'prompts')('classifyTodoTags', {
    title: JSON.stringify(text),
    categories: JSON.stringify(catalogForPrompt()),
  });

  return runAiExclusive(async () => {
    if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
    const session = await createTaskSession(language, model);
    let destroyed = false;
    const destroy = () => {
      if (destroyed) return;
      destroyed = true;
      session.destroy();
    };

    signal?.addEventListener('abort', destroy, { once: true });
    try {
      if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
      const response = await session.prompt(prompt, {
        responseConstraint: responseSchema,
        ...(signal ? { signal } : {}),
      });
      if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
      const tags = sanitizeTags(JSON.parse(response)?.tags);
      if (tags.length === 0) throw new Error('No valid category returned');
      return tags;
    } finally {
      signal?.removeEventListener('abort', destroy);
      destroy();
    }
  }, {
    signal,
    priority: 'background',
    onPreempt,
  });
}
