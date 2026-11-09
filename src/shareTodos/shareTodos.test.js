
import { describe, it, expect } from 'vitest';
import { formatShareText } from './shareTodos.js';

describe('shareTodos', () => {
  it('formatea correctamente las tareas', () => {
    const todos = [
      { id: '1', text: 'Buy groceries' },
      { id: '2', text: 'Plan my week' },
    ];

    expect(formatShareText(todos)).toBe(
      '*ToDo IA*\n\n' +
      '- Buy groceries\n' +
      '- Plan my week'
    );
  });

  it('conserva el título con una lista vacía', () => {
    expect(formatShareText([])).toBe(
      '*ToDo IA*\n\n'
    );
  });
});
