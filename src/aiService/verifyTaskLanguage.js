export async function isConfidentlyWrongLanguage(
  text,
  expectedLanguage,
  api = globalThis.LanguageDetector
) {
  if (
    typeof text !== 'string' ||
    text.trim().split(/\s+/u).length < 3 ||
    typeof api?.availability !== 'function' ||
    typeof api?.create !== 'function'
  ) {
    return false;
  }

  try {
    // No descargar otro modelo sin consentimiento.
    if (await api.availability() !== 'available') {
      return false;
    }

    const detector = await api.create();

    try {
      const results = await detector.detect(text);
      const best = results?.[0];

      return (
        ['es', 'en'].includes(best?.detectedLanguage) &&
        best.detectedLanguage !== expectedLanguage &&
        best.confidence >= 0.9
      );
    } finally {
      detector.destroy?.();
    }
  } catch {
    // Sin detector fiable, no rechazamos textos válidos.
    return false;
  }
}
