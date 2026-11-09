import { useEffect, useRef, useState } from 'react';
import {
  getPromptAvailability,
  downloadModel,
  prepareModel,
} from './aiService.js';

export default function useAiModel(language) {
  const [status, setStatus] = useState('checking');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [modelLoadProgress, setModelLoadProgress] = useState(0);
  const [generationSlow, setGenerationSlow] = useState(false);

  const slowTimerRef = useRef(null);
  const initialCheckDoneRef = useRef(false);

  // Comprobar disponibilidad y precargar el modelo.
  useEffect(() => {
    let active = true;

    getPromptAvailability(language).then(async (availability) => {
      if (!active) return;

      const initialCheck = !initialCheckDoneRef.current;
      initialCheckDoneRef.current = true;

      setStatus(availability);
      setReady(false);

      if (availability !== 'available') {
        if (initialCheck) setDialogOpen(true);
        return;
      }

      try {
        await prepareModel(language);
        if (active) setReady(true);
      } catch {
        if (!active) return;
        setStatus('error');
        if (initialCheck) setDialogOpen(true);
      }
    });

    return () => {
      active = false;
    };
  }, [language]);

  // Limpiar temporizadores al desmontar.
  useEffect(() => {
    return () => window.clearTimeout(slowTimerRef.current);
  }, []);

  // Reintentar una comprobación.
  async function retry() {
    setError('');
    setReady(false);
    setModelLoadProgress(0);
    setStatus('checking');

    const availability = await getPromptAvailability(language);
    setStatus(availability);

    if (availability !== 'available') {
      setDialogOpen(true);
      return;
    }

    try {
      await prepareModel(language);
      setReady(true);
      setDialogOpen(false);
    } catch {
      setStatus('error');
      setDialogOpen(true);
    }
  }

  // Descargar y preparar el modelo con autorización del usuario.
  async function download() {
    if (busy) return;

    setBusy(true);
    setReady(false);
    setError('');
    setDownloadProgress(null);
    setModelLoadProgress(0);

    try {
      await downloadModel(language, setDownloadProgress);

      const availability = await getPromptAvailability(language);
      setStatus(availability);
      setReady(availability === 'available');

      if (availability === 'available') {
        setDialogOpen(false);
      } else {
        setError('aiDownloadFailed');
      }
    } catch {
      setError('aiDownloadFailed');
      setStatus(await getPromptAvailability(language));
    } finally {
      setBusy(false);
    }
  }

  function beginGeneration() {
    window.clearTimeout(slowTimerRef.current);
    setGenerationSlow(false);
    setModelLoadProgress(0);

    slowTimerRef.current = window.setTimeout(() => {
      setGenerationSlow(true);
    }, 450);
  }

  function endGeneration() {
    window.clearTimeout(slowTimerRef.current);
    slowTimerRef.current = null;
    setGenerationSlow(false);
  }

  function reportUnavailable() {
    setReady(false);
    setStatus('unavailable');
    setDialogOpen(true);
  }

  const modelIndicator = generationSlow
    ? 'ai-model-loading'
    : ready
      ? 'ai-model-ready'
      : (status === 'checking' || status === 'available' || busy)
        ? 'ai-model-loading'
        : 'ai-model-idle';

  // Progreso visual simulado: hasta 90 % en 30 segundos.
  useEffect(() => {
    if (modelIndicator !== 'ai-model-loading') return;

    const start = performance.now();

    const interval = window.setInterval(() => {
      const elapsed = performance.now() - start;

      setModelLoadProgress(
        Math.min(90, (elapsed / 30000) * 90)
      );
    }, 100);

    return () => window.clearInterval(interval);
  }, [modelIndicator]);

  return {
    status,
    ready,
    busy,
    modelIndicator,
    modelLoadProgress,
    beginGeneration,
    endGeneration,
    reportUnavailable,
    openDialog: () => setDialogOpen(true),

    dialogProps: {
      open: dialogOpen,
      status,
      busy,
      progress: downloadProgress,
      error,
      onClose: () => setDialogOpen(false),
      onDownload: download,
      onRetry: retry,
    },
  };
}
