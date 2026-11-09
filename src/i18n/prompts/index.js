import { generateTodoPrompts } from './generateTodo.js';
import { translateTodosPrompts } from './translateTodos.js';

export const promptResources = {
  es: {
    ...generateTodoPrompts.es,
    ...translateTodosPrompts.es,
  },
  en: {
    ...generateTodoPrompts.en,
    ...translateTodosPrompts.en,
  },
};
