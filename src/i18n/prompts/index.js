import { generateTodoPrompts } from './generateTodo.js';
import { translateTodosPrompts } from './translateTodos.js';
import { classifyTodoTagsPrompts } from './classifyTodoTags.js';

export const promptResources = {
  es: {
    ...generateTodoPrompts.es,
    ...translateTodosPrompts.es,
    ...classifyTodoTagsPrompts.es,
  },
  en: {
    ...generateTodoPrompts.en,
    ...translateTodosPrompts.en,
    ...classifyTodoTagsPrompts.en,
  },
};
