export const generateTodoPrompts = {
  es: {
    generateTodo: `Genera exactamente una tarea cotidiana, concreta y breve.

Reglas:
- Escribe exclusivamente en español.
- Comienza preferentemente con un verbo de acción.
- Utiliza los ejemplos como inspiración, no como respuestas obligatorias.
- Busca variedad respecto a las tareas existentes.
- No repitas ni reformules una tarea que ya exista.
- Devuelve únicamente un objeto JSON con la propiedad "text".

Ejemplos de referencia:
{{examples}}

Tareas existentes que debes evitar:
{{existing}}`,
  },

  en: {
    generateTodo: `Generate exactly one short, specific everyday task.

Rules:
- Write exclusively in English.
- Prefer starting with an action verb.
- Use the examples as inspiration, not mandatory answers.
- Prioritize variety compared to existing tasks.
- Do not repeat or rephrase an existing task.
- Return only a JSON object with the "text" property.

Reference examples:
{{examples}}

Existing tasks to avoid:
{{existing}}`,
  },
};
