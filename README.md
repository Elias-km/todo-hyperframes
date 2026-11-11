# ToDo IA Local en Chrome (Gemini Nano 4)

Aplicación web de gestión de tareas con **inteligencia artificial local en el navegador**. Permite crear, organizar, traducir y filtrar tareas, manteniendo sus datos en el dispositivo.

**Aplicación:** https://elias-km.github.io/todo-ia/

## Funcionalidades

- **Gestión de tareas:** añadir tareas manualmente, seleccionarlas, eliminarlas individualmente (también con doble clic) o en grupo, y deshacer o rehacer cambios.
- **Generación con IA:** crear una tarea a partir de **10 ejemplos** elegidos del catálogo de **194 muestras** en español e inglés. Las muestras rotan para favorecer la variedad y no se envía la lista completa al modelo.
- **Control de repeticiones:** comprobación local y conservadora frente a las tareas existentes y los ejemplos mostrados, con un segundo intento de generación como máximo. No garantiza detectar todas las equivalencias semánticas.
- **Etiquetado inteligente:** asignación de **1 a 3 categorías** de un catálogo fijo de **36**. Las tareas generadas reciben título y categorías en una misma respuesta; las tareas escritas manualmente se guardan de inmediato y se etiquetan después mediante IA. Algunas asociaciones evidentes se completan con reglas locales.
- **Filtros dinámicos:** panel con icono Spark visible incluso antes de activar los filtros. A partir de **4 tareas** muestra hasta **5 categorías relevantes**, ordenadas por número de coincidencias. Los chips pueden ocupar varias líneas; cada categoría tiene un color estable.
- **Selección de filtros:** selección múltiple con coincidencia de cualquiera de las categorías activas. Mientras **«Todos»** está seleccionado se muestran todas las tareas y las categorías elegidas se resaltan; al desactivar «Todos» se limita la lista a las categorías seleccionadas.
- **Idiomas:** interfaz en español e inglés, con traducción local de las tareas cuando es necesario y conservación de sus textos originales.
- **Personalización:** temas claro, oscuro y radioactivo.
- **Otras funciones:** compartir/copiar tareas, persistencia local y lista vacía en una instalación nueva.

## Cómo funciona la IA

La aplicación utiliza la **Prompt API** del navegador (`LanguageModel`) para ejecutar las funciones inteligentes en el dispositivo, sin un servidor de IA propio.

- **Generar:** se envían las diez muestras y el catálogo fijo de categorías; la IA devuelve el título y sus etiquetas.
- **Añadir manualmente:** el título lo escribe el usuario y se conserva tal cual; la clasificación se solicita de forma independiente, sin bloquear la creación de la tarea.
- **Filtrar:** es una operación de JavaScript sobre las etiquetas guardadas. **Cambiar un filtro no genera nuevas peticiones a la IA.**
- **Traducir:** se utiliza el modelo local cuando hay tareas que requieren traducción al idioma seleccionado.
- **Prioridades:** la cola de operaciones da prioridad a las acciones interactivas frente al etiquetado en segundo plano.

> **Compatibilidad:** las funciones inteligentes requieren un navegador y un dispositivo compatibles con la Prompt API y el modelo local correspondiente, que puede necesitar una descarga inicial. La gestión manual de tareas sigue disponible cuando la IA no está disponible. Los resultados de generación, traducción y etiquetado pueden variar y no son infalibles.

## Tecnologías

- React 19 y JavaScript (JSX)
- Vite 8
- CSS Modules
- i18next y react-i18next
- API `LanguageModel` del navegador (IA local)
- `localStorage` (persistencia)
- Vitest, React Testing Library y Playwright (pruebas)
- GitHub Pages (alojamiento estático)

## Instalación y desarrollo

Requiere **Node.js** y **npm**.

```bash
npm ci
npm run dev
```

Abre la dirección local que indique Vite en la terminal.

### Validación

```bash
npm run test
npm run lint
npm run build
git diff --check
```

Para ejecutar las pruebas de navegador, prepara Playwright cuando sea necesario:

```bash
npx playwright install chromium
npm run e2e
```

Para visualizar localmente la compilación de producción:

```bash
npm run preview
```

## Organización del código

```text
src/
├── aiService/       # Disponibilidad, sesiones, cola de IA y detección de idioma
├── components/      # Interfaz y estilos por componente (CSS Modules)
├── filterTodos/      # Catálogo fijo, etiquetado, reglas locales y filtros
├── generateTodo/     # Generación, ejemplos y control de repeticiones
├── i18n/             # Textos y prompts en español e inglés
├── theme/            # Temas visuales
├── todoReducer/      # Estado de tareas, selección, deshacer y rehacer
├── todoStorage/      # Lectura, normalización y guardado local
├── translateTodos/   # Traducción de tareas y caché de traducciones
├── shareTodos/       # Compartir/copiar tareas
├── App.jsx           # Integración de la aplicación
└── main.jsx          # Punto de entrada
tests/
├── integration/      # Pruebas de integración de la interfaz
└── e2e/              # Pruebas de navegador con Playwright
```

La clasificación **no recalcula globalmente** las categorías cuando se añade una tarea: cada tarea se etiqueta individualmente, y los filtros se obtienen contando sus etiquetas almacenadas.

## Persistencia

Las tareas se guardan en `localStorage` con la clave `todo-ia:todos` (estructura actual, versión 3). Cada tarea conserva su identificador y título; cuando corresponde, también el idioma original, las traducciones y los identificadores de categorías.

El idioma seleccionado y el tema visual también se recuerdan localmente. No hay sincronización de tareas entre dispositivos ni backend de cuentas de usuario.

Las tareas guardadas antes del catálogo fijo pueden etiquetarse individualmente cuando la IA esté disponible. Si una clasificación falla, la tarea sigue siendo utilizable.

## Publicación

La aplicación está configurada para servirse desde la ruta base `/todo-ia/` mediante Vite y publicarse en **GitHub Pages**:

https://elias-km.github.io/todo-ia/

La construcción de producción se genera con `npm run build`. La configuración de despliegue y la publicación deben verificarse por separado; construir el proyecto no lo publica automáticamente.
