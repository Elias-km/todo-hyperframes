const TITLE = 'ToDo List React';

export function formatShareText(todos) {
  const items = todos.map(({ text }) => `- ${text}`).join('\n');

  return `*${TITLE}*\n\n${items}`;
}

export async function shareTodos(todos) {
  const text = formatShareText(todos);

  if (navigator.share) {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch (error) {
      if (error.name === 'AbortError') {
        return 'cancelled';
      }
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
