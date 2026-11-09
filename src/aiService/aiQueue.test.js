import { describe, expect, it, vi } from 'vitest';
import { runAiExclusive } from './aiQueue.js';

describe('Cola de operaciones IA', () => {
  it('no ejecuta generación y traducción a la vez', async () => {
    const order = [];
    let finishTranslation;

    const translation = runAiExclusive(() => {
      order.push('translation:start');

      return new Promise((resolve) => {
        finishTranslation = resolve;
      });
    });

    const generate = runAiExclusive(() => {
      order.push('generation:start');
      return 'Generated task';
    });

    await Promise.resolve();

    expect(order).toEqual(['translation:start']);

    finishTranslation('Translation complete');

    await expect(translation).resolves.toBe('Translation complete');
    await expect(generate).resolves.toBe('Generated task');

    expect(order).toEqual([
      'translation:start',
      'generation:start',
    ]);
  });

  it('no ejecuta una petición cancelada mientras esperaba', async () => {
    let finishFirst;

    const first = runAiExclusive(
      () => new Promise((resolve) => {
        finishFirst = resolve;
      })
    );

    const controller = new AbortController();
    const operation = vi.fn();

    const cancelled = runAiExclusive(
      operation,
      { signal: controller.signal }
    );

    await Promise.resolve();
    controller.abort();
    finishFirst();

    await first;

    await expect(cancelled).rejects.toMatchObject({
      name: 'AbortError',
    });

    expect(operation).not.toHaveBeenCalled();
  });
});
