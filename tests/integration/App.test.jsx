// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App.jsx';
import { loadTodos } from '../../src/todoStorage/todoStorage.js';

const initialTodos = [
  { id: '1', text: 'Plan my week' },
  { id: '2', text: 'Buy groceries' },
];

beforeEach(() => {
  localStorage.clear();

  vi.stubGlobal('LanguageModel', {
    availability: vi.fn().mockResolvedValue('available'),
    create: vi.fn().mockResolvedValue({
      clone: vi.fn().mockResolvedValue({
        prompt: vi.fn().mockResolvedValue(
          JSON.stringify({ text: 'Tarea de prueba' })
        ),
        destroy: vi.fn(),
      }),
      destroy: vi.fn(),
    }),
  });

  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  vi.stubGlobal('crypto', { randomUUID: () => 'new-task-id' });

  // Simulamos las APIs nativas de dialog no implementadas por jsdom.
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };

  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function setup() {
  const user = userEvent.setup();
  render(<App initialTodos={initialTodos} />);
  return user;
}

async function openForm(user) {
  const card = screen.getByRole('region', {
    name: 'ToDo IA',
  });

  await user.click(within(card).getByRole('button', { name: 'AÑADIR' }));

  return screen.getByRole('dialog');
}

describe('App - integración', () => {
  it('muestra las tareas iniciales y las guarda', () => {
    setup();

    expect(screen.getByRole('button', {
      name: 'Plan my week',
    })).toBeTruthy();

    expect(screen.getByRole('button', {
      name: 'Buy groceries',
    })).toBeTruthy();

    expect(screen.getByRole('button', {
      name: 'ELIMINAR',
    }).disabled).toBe(true);

    expect(loadTodos()).toEqual(initialTodos);
  });

  it('rechaza textos vacíos y permite añadir tareas', async () => {
    const user = setup();
    const dialog = await openForm(user);
    const input = within(dialog).getByRole('textbox');

    expect(document.activeElement).toBe(input);

    await user.type(input, '   ');
    await user.click(within(dialog).getByRole('button', {
      name: 'AÑADIR',
    }));

    expect(screen.getAllByRole('listitem')).toHaveLength(2);

    await user.clear(input);
    await user.type(input, 'Nueva tarea{Enter}');

    expect(screen.getByRole('button', {
      name: 'Nueva tarea',
    })).toBeTruthy();

    expect(loadTodos().map((todo) => todo.text)).toEqual([
      'Plan my week',
      'Buy groceries',
      'Nueva tarea',
    ]);
  });

  it('selecciona, elimina, deshace y rehace', async () => {
    const user = setup();

    await user.click(screen.getByRole('button', {
      name: 'Plan my week',
    }));

    await user.click(screen.getByRole('button', {
      name: 'Buy groceries',
    }));

    expect(screen.getByRole('button', {
      name: 'Plan my week',
    }).getAttribute('aria-pressed')).toBe('true');

    await user.click(screen.getByRole('button', {
      name: 'ELIMINAR',
    }));

    expect(screen.queryAllByRole('listitem')).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'Deshacer' }));

    expect(screen.getAllByRole('listitem')).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Rehacer' }));

    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(loadTodos()).toEqual([]);
  });

  it('elimina una tarea mediante doble clic', async () => {
    const user = setup();

    await user.dblClick(screen.getByRole('button', {
      name: 'Plan my week',
    }));

    expect(screen.queryByRole('button', {
      name: 'Plan my week',
    })).toBeNull();

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('cancela el formulario sin añadir tareas', async () => {
    const user = setup();
    const dialog = await openForm(user);

    await user.type(within(dialog).getByRole('textbox'), 'Descartada');

    await user.click(within(dialog).getByRole('button', {
      name: 'CANCELAR',
    }));

    expect(dialog.open).toBe(false);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(loadTodos()).toEqual(initialTodos);
  });
});

describe('Theme - integración', () => {
  it('alterna Claro, Oscuro, Radioactivo y Claro', async () => {
    const user = setup();

    await user.click(screen.getByRole('button', {
      name: 'Cambiar al tema oscuro',
    }));

    expect(document.documentElement.dataset.theme).toBe('dark');

    await user.click(screen.getByRole('button', {
      name: 'Cambiar al tema radioactivo',
    }));

    expect(document.documentElement.dataset.theme).toBe('radioactive');

    await user.click(screen.getByRole('button', {
      name: 'Cambiar al tema claro',
    }));

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('todo-ia:theme')).toBe('light');
  });

  it('recupera el último tema seleccionado', () => {
    localStorage.setItem('todo-ia:theme', 'radioactive');
    setup();

    expect(document.documentElement.dataset.theme).toBe('radioactive');

    expect(screen.getByRole('button', {
      name: 'Cambiar al tema claro',
    })).toBeTruthy();
  });
});


describe('IA - integración', () => {
  it('muestra el aviso en un navegador incompatible', async () => {
    vi.stubGlobal('LanguageModel', undefined);
    setup();

    expect(await screen.findByRole('dialog', {
      name: 'Funciones de IA no disponibles',
    })).toBeTruthy();
  });
});

describe('Generación de tareas con IA', () => {
  it('genera, guarda y permite deshacer una tarea', async () => {
    const destroy = vi.fn();

    vi.stubGlobal('LanguageModel', {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue({
        prompt: vi.fn().mockResolvedValue(
          JSON.stringify({ text: 'Pasear al perro' })
        ),
        destroy,
      }),
    });

    const user = setup();

    const button = screen.getByRole('button', {
      name: 'Generar tarea con IA',
    });

    await waitFor(() => {
      expect(button.disabled).toBe(false);
    });

    await user.click(button);

    expect(await screen.findByRole('button', {
      name: 'Pasear al perro',
    })).toBeTruthy();

    expect(loadTodos().some(
      (todo) => todo.text === 'Pasear al perro'
    )).toBe(true);

    expect(destroy).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', {
      name: 'Deshacer',
    }));

    expect(screen.queryByRole('button', {
      name: 'Pasear al perro',
    })).toBeNull();
  });

  it('abre el modal si la IA no está disponible', async () => {
    vi.stubGlobal('LanguageModel', undefined);

    const user = setup();

    const button = screen.getByRole('button', {
      name: 'Generar tarea con IA',
    });

    await waitFor(() => {
      expect(button.disabled).toBe(false);
    });

    const dialog = await screen.findByRole('dialog', {
      name: 'Funciones de IA no disponibles',
    });

    await user.click(within(dialog).getByRole('button', {
      name: 'Cerrar',
    }));

    await user.click(button);

    expect(screen.getByRole('dialog', {
      name: 'Funciones de IA no disponibles',
    })).toBeTruthy();
  });
});

describe('Identidad visual de IA local', () => {
  it('explica el procesamiento local e identifica las acciones IA', () => {
    setup();

    expect(screen.queryByText(/IA local: las tareas/i)).toBeNull();

    const generateButton = screen.getByRole('button', {
      name: 'Generar tarea con IA',
    });

    expect(
      generateButton.querySelector('[aria-hidden="true"]')
    ).not.toBeNull();

    expect(screen.queryByRole('button', {
      name: 'Estado de IA',
    })).toBeNull();
  });

  it('explica el modelo local en el modal de incompatibilidad', async () => {
    vi.stubGlobal('LanguageModel', undefined);

    setup();

    const dialog = await screen.findByRole('dialog', {
      name: 'Funciones de IA no disponibles',
    });

    expect(
      within(dialog).getByText(/La IA de ToDo IA/i)
    ).toBeTruthy();
  });
});

describe('Preparación visual del modelo IA', () => {
  it('pasa de naranja a verde cuando termina la preparación', async () => {
    let resolveCreate;

    const create = vi.fn(() => new Promise((resolve) => {
      resolveCreate = resolve;
    }));

    vi.stubGlobal('LanguageModel', {
      availability: vi.fn().mockResolvedValue('available'),
      create,
    });

    setup();

    const button = screen.getByRole('button', {
      name: 'Generar tarea con IA',
    });

    await waitFor(() => {
      expect(create).toHaveBeenCalled();
      expect(button.classList.contains('ai-model-loading')).toBe(true);
    });

    expect(button.disabled).toBe(true);

    resolveCreate({
      clone: vi.fn(),
      destroy: vi.fn(),
    });

    await waitFor(() => {
      expect(button.classList.contains('ai-model-ready')).toBe(true);
    });

    expect(button.disabled).toBe(false);
  });
});

describe('Scroll automático', () => {
  it('desplaza a la nueva tarea, pero no al cargar', async () => {
    const previous = Element.prototype.scrollIntoView;
    const scroll = vi.fn();

    Element.prototype.scrollIntoView = scroll;

    try {
      const user = setup();

      expect(scroll).not.toHaveBeenCalled();

      const dialog = await openForm(user);

      await user.type(
        within(dialog).getByRole('textbox'),
        'Nueva tarea{Enter}'
      );

      await waitFor(() => {
        expect(scroll).toHaveBeenCalledWith({
          behavior: 'auto',
          block: 'nearest',
        });
      });
    } finally {
      if (previous) {
        Element.prototype.scrollIntoView = previous;
      } else {
        delete Element.prototype.scrollIntoView;
      }
    }
  });
});

describe('Progreso durante generación IA', () => {
  it('reactiva la barra naranja si la generación tarda', async () => {
    let resolvePrompt;

    const prompt = vi.fn(() => new Promise((resolve) => {
      resolvePrompt = resolve;
    }));

    const model = {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue({
        clone: vi.fn().mockResolvedValue({
          prompt,
          destroy: vi.fn(),
        }),
        destroy: vi.fn(),
      }),
    };

    vi.stubGlobal('LanguageModel', model);

    const user = setup();

    const button = screen.getByRole('button', {
      name: 'Generar tarea con IA',
    });

    await waitFor(() => {
      expect(button.classList.contains('ai-model-ready')).toBe(true);
    });

    await user.click(button);

    await waitFor(() => {
      expect(button.classList.contains('ai-model-loading')).toBe(true);
    }, { timeout: 2000 });

    expect(button.disabled).toBe(true);

    resolvePrompt(JSON.stringify({
      text: 'Revisar el calendario',
    }));

    await waitFor(() => {
      expect(button.classList.contains('ai-model-ready')).toBe(true);
    });

    expect(screen.getByRole('button', {
      name: 'Revisar el calendario',
    })).toBeTruthy();
  });
});

describe('Cambio de idioma con traducción local', () => {
  it('traduce al inglés y recupera el español original', async () => {
    const session = {
      prompt: vi.fn().mockResolvedValue(JSON.stringify({
        translations: [
          { id: '1', text: 'Buy bread' },
          { id: '2', text: 'Walk the dog' },
        ],
      })),
      destroy: vi.fn(),
    };

    const base = {
      clone: vi.fn(),
      destroy: vi.fn(),
    };

    const model = {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockImplementation((options) => {
        const languages = options.expectedInputs[0].languages;

        return Promise.resolve(
          languages.length === 2 ? session : base
        );
      }),
    };

    vi.stubGlobal('LanguageModel', model);

    const user = userEvent.setup();

    render(<App initialTodos={[
      { id: '1', text: 'Comprar pan' },
      { id: '2', text: 'Pasear al perro' },
    ]} />);

    const generateButton = screen.getByRole('button', {
      name: 'Generar tarea con IA',
    });

    await waitFor(() => {
      expect(generateButton.disabled).toBe(false);
    });

    await user.click(screen.getByLabelText('Idioma: Español'));
    await user.click(screen.getByRole('button', {
      name: 'English',
    }));

    expect(await screen.findByRole('button', {
      name: 'Buy bread',
    })).toBeTruthy();

    expect(screen.getByRole('button', {
      name: 'Walk the dog',
    })).toBeTruthy();

    const saved = loadTodos();

    expect(saved[0].text).toBe('Comprar pan');
    expect(saved[0].translations.en).toBe('Buy bread');
    expect(saved[0].originalLanguage).toBe('es');

    await waitFor(() => {
      expect(screen.getByRole('button', {
        name: 'Generate task with AI',
      }).disabled).toBe(false);
    });

    await user.click(screen.getByLabelText('Language: English'));
    await user.click(screen.getByRole('button', {
      name: 'Español',
    }));

    expect(await screen.findByRole('button', {
      name: 'Comprar pan',
    })).toBeTruthy();

    // Regresar al original no necesita otra inferencia.
    expect(session.prompt).toHaveBeenCalledTimes(1);
  });
});

describe('Interfaz independiente de la IA', () => {
  it('cambia inmediatamente a inglés aunque no exista el modelo', async () => {
    const { changeLanguage } = await import(
      '../../src/i18n/i18n.js'
    );

    await changeLanguage('es');

    vi.stubGlobal('LanguageModel', undefined);

    try {
      const user = setup();

      await user.click(screen.getByLabelText('Idioma: Español'));
      await user.click(screen.getByRole('button', {
        name: 'English',
      }));

      expect(await screen.findByLabelText(
        'Language: English'
      )).toBeTruthy();

      // La lista no desaparece ni se pierde.
      expect(screen.getByRole('button', {
        name: 'Plan my week',
      })).toBeTruthy();

      // Los demás controles siguen disponibles.
      expect(screen.getByRole('button', {
        name: 'ADD',
      }).disabled).toBe(false);

      expect(await screen.findByText(
        /Tasks could not be translated/i
      )).toBeTruthy();
    } finally {
      await changeLanguage('es');
    }
  });
});

describe('Generación durante una traducción', () => {
  it('espera a la traducción y guarda la nueva tarea en el idioma correcto', async () => {
    const { changeLanguage } = await import(
      '../../src/i18n/i18n.js'
    );

    await changeLanguage('es');

    let finishTranslation;

    const translationPrompt = vi.fn(() => new Promise((resolve) => {
      finishTranslation = resolve;
    }));

    const generationPrompt = vi.fn().mockResolvedValue(
      JSON.stringify({ text: 'Walk the dog' })
    );

    const model = {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockImplementation(async (options) => {
        const languages = options.expectedInputs[0].languages;

        if (languages.length === 2) {
          return {
            prompt: translationPrompt,
            destroy: vi.fn(),
          };
        }

        return {
          clone: vi.fn().mockResolvedValue({
            prompt: generationPrompt,
            destroy: vi.fn(),
          }),
          destroy: vi.fn(),
        };
      }),
    };

    vi.stubGlobal('LanguageModel', model);

    try {
      const user = userEvent.setup();

      render(<App initialTodos={[
        {
          id: '1',
          text: 'Comprar pan',
          originalLanguage: 'es',
        },
      ]} />);

      await waitFor(() => {
        expect(screen.getByRole('button', {
          name: 'Generar tarea con IA',
        }).disabled).toBe(false);
      });

      await user.click(screen.getByLabelText('Idioma: Español'));
      await user.click(screen.getByRole('button', {
        name: 'English',
      }));

      await waitFor(() => {
        expect(translationPrompt).toHaveBeenCalledOnce();
      });

      const button = screen.getByRole('button', {
        name: 'Generate task with AI',
      });

      await waitFor(() => {
        expect(button.disabled).toBe(false);
      });

      await user.click(button);

      // La generación queda esperando su turno.
      expect(generationPrompt).not.toHaveBeenCalled();

      finishTranslation(JSON.stringify({
        translations: [{
          id: '1',
          text: 'Buy bread',
        }],
      }));

      expect(await screen.findByRole('button', {
        name: 'Walk the dog',
      })).toBeTruthy();

      const generated = loadTodos().find(
        (todo) => todo.text === 'Walk the dog'
      );

      expect(generated.originalLanguage).toBe('en');

      expect(screen.getByRole('button', {
        name: 'Buy bread',
      })).toBeTruthy();
    } finally {
      if (finishTranslation) {
        finishTranslation(JSON.stringify({
          translations: [{ id: '1', text: 'Buy bread' }],
        }));
      }

      await changeLanguage('es');
    }
  });
});
