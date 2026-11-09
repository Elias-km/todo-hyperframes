let pending = Promise.resolve();

export function runAiExclusive(operation, { signal } = {}) {
  const current = pending.then(() => {
    if (signal?.aborted) {
      throw new DOMException('Operation cancelled', 'AbortError');
    }

    return operation();
  });

  // Un fallo no debe bloquear las operaciones posteriores.
  pending = current.then(
    () => undefined,
    () => undefined
  );

  return current;
}
