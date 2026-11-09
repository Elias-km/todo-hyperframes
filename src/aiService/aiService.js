const VALID_STATES = [
  'available',
  'downloadable',
  'downloading',
  'unavailable',
];

let prepared = null;

function getOptions(language) {
  return {
    expectedInputs: [
      { type: 'text', languages: [language] },
    ],
    expectedOutputs: [
      { type: 'text', languages: [language] },
    ],
  };
}

export async function getPromptAvailability(
  language = 'es',
  model = globalThis.LanguageModel
) {
  if (typeof model?.availability !== 'function') {
    return 'unavailable';
  }

  try {
    const status = await model.availability(
      getOptions(language)
    );

    return VALID_STATES.includes(status)
      ? status
      : 'error';
  } catch {
    return 'error';
  }
}

export function releasePreparedModel() {
  const previous = prepared;
  prepared = null;

  if (previous) {
    void previous.promise
      .then((session) => session.destroy())
      .catch(() => {});
  }
}

export async function prepareModel(
  language = 'es',
  onProgress = () => {},
  model = globalThis.LanguageModel
) {
  if (typeof model?.create !== 'function') {
    throw new Error('AI unavailable');
  }

  if (
    prepared?.language === language &&
    prepared.model === model
  ) {
    return prepared.promise;
  }

  releasePreparedModel();

  const promise = model.create({
    ...getOptions(language),
    monitor(monitor) {
      monitor.addEventListener('downloadprogress', (event) => {
        const loaded = Number(event.loaded);

        if (Number.isFinite(loaded)) {
          onProgress(Math.round(
            Math.max(0, Math.min(1, loaded)) * 100
          ));
        }
      });
    },
  });

  const entry = { language, model, promise };
  prepared = entry;

  try {
    return await promise;
  } catch (error) {
    if (prepared === entry) prepared = null;
    throw error;
  }
}

export async function createTaskSession(
  language = 'es',
  model = globalThis.LanguageModel
) {
  async function createSession() {
    const base = await prepareModel(language, () => {}, model);

    if (typeof base.clone === 'function') {
      return base.clone();
    }

    return model.create(getOptions(language));
  }

  try {
    return await createSession();
  } catch (error) {
    // Descartar una sesión que ha dejado de funcionar.
    releasePreparedModel();

    const status = await getPromptAvailability(language, model);

    if (status !== 'available') {
      throw new Error('AI unavailable', { cause: error });
    }

    // Un único intento de recuperación.
    return createSession();
  }
}

export function downloadModel(
  language = 'es',
  onProgress = () => {},
  model = globalThis.LanguageModel
) {
  // No destruir: conservar el modelo preparado.
  return prepareModel(language, onProgress, model)
    .then(() => {});
}
