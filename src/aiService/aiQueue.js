// Una única sesión activa de Prompt API. Las acciones interactivas adelantan
// a las clasificaciones pendientes y pueden interrumpir una clasificación.
let running = null;
const waiting = [];

function abortError() {
  const error = new Error('Operation cancelled');
  error.name = 'AbortError';
  return error;
}

function drain() {
  if (running) return;

  while (waiting.length > 0) {
    const interactiveIndex = waiting.findIndex(
      (job) => job.priority !== 'background'
    );
    const index = interactiveIndex >= 0 ? interactiveIndex : 0;
    const [job] = waiting.splice(index, 1);

    if (job.signal?.aborted) {
      job.reject(abortError());
      continue;
    }

    running = job;
    let stopListening = () => {};

    const operation = Promise.resolve().then(() => {
      if (job.signal?.aborted) throw abortError();
      return job.operation();
    });

    const cancelled = new Promise((_, reject) => {
      if (!job.signal) return;
      const onAbort = () => reject(abortError());
      job.signal.addEventListener('abort', onAbort, { once: true });
      stopListening = () =>
        job.signal.removeEventListener('abort', onAbort);
      if (job.signal.aborted) onAbort();
    });

    const work = job.signal
      ? Promise.race([operation, cancelled])
      : operation;

    void work.then(job.resolve, job.reject).finally(() => {
      stopListening();
      running = null;
      drain();
    });
    return;
  }
}

export function runAiExclusive(operation, {
  signal,
  priority = 'interactive',
  onPreempt,
} = {}) {
  if (signal?.aborted) return Promise.reject(abortError());

  return new Promise((resolve, reject) => {
    waiting.push({
      operation, signal, priority, onPreempt, resolve, reject,
    });

    if (
      priority !== 'background' &&
      running?.priority === 'background'
    ) {
      running.onPreempt?.();
    }

    drain();
  });
}
