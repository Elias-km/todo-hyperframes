import { useEffect, useState } from 'react';
import { classifyTodoTags } from './classifyTodoTags.js';

function taskKey(id, text) {
  return JSON.stringify([id, text]);
}

export default function useTodoTagging({
  todos,
  language,
  aiReady,
  translating,
  dispatch,
}) {
  const [attempts, setAttempts] = useState({});
  const [retryRevision, setRetryRevision] = useState(0);

  // Las tareas anteriores a la migración no tienen tagsVersion: 1.
  // Se etiquetan individualmente; nunca se envía toda la lista a la IA.
  const pending = todos.find((todo) =>
    (todo.tagsVersion !== 1 || !Array.isArray(todo.conceptIds)) &&
    (attempts[taskKey(todo.id, todo.text)] ?? 0) < 2
  );

  const pendingId = pending?.id;
  const pendingText = pending?.text;

  useEffect(() => {
    if (!pendingId || !aiReady || translating) return;

    let cancelled = false;
    const controller = new AbortController();

    const timer = window.setTimeout(() => {
      void classifyTodoTags({
        text: pendingText,
        language,
        signal: controller.signal,
        onPreempt: () => controller.abort(),
      }).then((conceptIds) => {
        if (cancelled) return;
        dispatch({
          type: 'assignFixedTags',
          id: pendingId,
          text: pendingText,
          conceptIds,
        });
      }).catch((error) => {
        if (cancelled) return;
        if (error?.name === 'AbortError') {
          // Reanudar después de liberar el modelo para la generación.
          setRetryRevision((revision) => revision + 1);
          return;
        }
        console.warn('[ToDo IA] No se pudo etiquetar una tarea:', error);
        const key = taskKey(pendingId, pendingText);
        setAttempts((previous) => ({
          ...previous,
          [key]: (previous[key] ?? 0) + 1,
        }));
        setRetryRevision((revision) => revision + 1);
      });
    }, 650);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [pendingId, pendingText, language, aiReady, translating, dispatch, retryRevision]);

}
