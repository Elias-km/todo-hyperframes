import { useEffect, useMemo, useState } from 'react';
import { changeLanguage } from '../i18n/i18n.js';
import {
  getDisplayedText,
  getMissingTranslations,
  translateTodos,
} from './translateTodos.js';

const LANGUAGES = ['es', 'en'];

export default function useTodoTranslation({
  todos,
  language,
  aiReady,
  aiStatus,
  dispatch,
}) {
  const [failedAttempt, setFailedAttempt] = useState(null);

  const displayTodos = useMemo(
    () => todos.map((todo) => ({
      ...todo,
      text: getDisplayedText(todo, language),
    })),
    [todos, language]
  );

  const missing = useMemo(
    () => getMissingTranslations(todos, language, language),
    [todos, language]
  );

  const attemptKey = JSON.stringify([
    language,
    aiReady,
    aiStatus,
    missing.map((todo) => [
      todo.id,
      todo.text,
      todo.originalLanguage,
    ]),
  ]);

  const failed = failedAttempt === attemptKey;

  const waitingForModel = [
    'checking',
    'available',
    'downloading',
  ].includes(aiStatus);

  const translating =
    missing.length > 0 &&
    !failed &&
    waitingForModel;

  const translationError =
    missing.length > 0 &&
    (failed || !waitingForModel);

  function requestLanguageChange(targetLanguage) {
    if (
      !LANGUAGES.includes(targetLanguage) ||
      targetLanguage === language
    ) {
      return;
    }

    // Migrar las tareas antiguas ANTES de cambiar el idioma.
    dispatch({
      type: 'tagOriginalLanguage',
      language,
    });

    // La interfaz no espera a la IA.
    void changeLanguage(targetLanguage);
  }

  useEffect(() => {
    if (
      missing.length === 0 ||
      !aiReady ||
      aiStatus !== 'available' ||
      failed
    ) {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function runTranslation() {
      try {
        // Cada tarea se traduce desde su idioma original.
        // Así funcionan listas con tareas en español e inglés.
        const groups = new Map();

        for (const todo of missing) {
          const source = todo.originalLanguage || language;

          if (!groups.has(source)) groups.set(source, []);
          groups.get(source).push(todo);
        }

        const results = await Promise.all(
          [...groups].map(async ([sourceLanguage, group]) => {
            return translateTodos({
              todos: group,
              sourceLanguage,
              targetLanguage: language,
              signal: controller.signal,
            });
          })
        );

        if (cancelled) return;

        const translations = Object.assign({}, ...results);

        // Solo aplicamos los resultados cuando TODOS los
        // grupos han terminado correctamente.
        dispatch({
          type: 'cacheTranslations',
          sourceLanguage: language,
          targetLanguage: language,
          translations,
        });
      } catch (error) {
        if (cancelled) return;

        // Conservar el detalle técnico para diagnosticar
        // problemas reales del modelo en Chrome.
        console.warn(
          '[ToDo IA] Error al traducir las tareas:',
          error
        );

        setFailedAttempt(attemptKey);
      }
    }

    void runTranslation();

    return () => {
      // Descarta traducciones de un idioma anterior
      // o de una lista modificada durante la operación.
      cancelled = true;
      controller.abort();
    };
  }, [
    missing,
    language,
    aiReady,
    aiStatus,
    failed,
    attemptKey,
    dispatch,
  ]);

  return {
    displayTodos,
    translating,
    pendingTranslationIds: new Set(
      translating ? missing.map((todo) => todo.id) : []
    ),
    translationError,
    requestLanguageChange,
  };
}
