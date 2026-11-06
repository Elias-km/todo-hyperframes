# ToDo List React

A lightweight task-list application built with **React and JavaScript**.

Developed as a frontend technical assessment using the supplied [Adobe XD design](https://xd.adobe.com/view/ea696dd0-8781-4460-8720-36deb2d19b2a-bf3a/).

This project implements the same functionality and visual design as [ToDo List Vanilla](https://github.com/Elias-km/todo-vanilla), using React's declarative component model.

**Live demo (after deployment):** https://elias-km.github.io/todo-react/

## Features

- Add tasks through an animated modal; empty entries are rejected.
- Select one or multiple tasks and delete them together.
- Delete individual tasks by double-clicking.
- Undo and redo changes.
- Automatically persist tasks in `localStorage`.
- Load three sample tasks on first use.
- Share tasks through the native share menu or clipboard fallback.
- Responsive design and keyboard-accessible controls.

Tasks are stored locally in the browser. Selection and undo/redo history are not persisted.

## Tech stack

- React and JavaScript (JSX)
- Vite
- CSS Modules and global CSS
- React Hooks (`useReducer`, `useState`, `useEffect`, `useRef`)
- Vitest and React Testing Library
- Playwright for optional E2E tests
- GitHub Actions and GitHub Pages

## Getting started

Requires Node.js 24 and npm.

```bash
npm ci
npm run dev
```

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run test` | Run unit and integration tests |
| `npm run lint` | Run ESLint |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run e2e` | Run E2E tests in visible Chromium |

For the first E2E execution:

```bash
npx playwright install chromium
npm run e2e
```

E2E tests run only on manual request.

## Project structure

```text
.github/workflows/
└── ci.yml                  # Validation and deployment

src/
├── components/
│   ├── TodoForm/           # Animated add-task modal
│   ├── TodoList/           # Task list
│   └── TodoItem/           # Task selection and deletion
├── todoReducer/            # State, actions and undo/redo
├── todoStorage/            # Local storage and validation
├── shareTodos/             # Native sharing and clipboard
├── bootstrap.js            # Initial tasks and hydration
├── App.jsx                 # Main React component
├── main.jsx                # React entry point
└── global.css              # Global styles

tests/
├── integration/            # React integration tests
└── e2e/                    # Browser tests

index.html                  # Application entry HTML
vite.config.js              # Vite and GitHub Pages configuration
playwright.config.js        # Playwright configuration
```

Related implementation, styles and unit tests follow the colocation principle.

## Architecture

The application uses React's built-in state management without external state libraries.

- `useReducer` manages tasks, selection and undo/redo history.
- `useState` manages local UI state.
- `useEffect` persists task changes to `localStorage`.
- `bootstrap.js` loads stored tasks or initializes sample tasks.
- Components communicate through props and callbacks.

The reducer is pure and independent of React components, browser storage and DOM manipulation.

## Testing and CI/CD

Vitest runs unit and integration tests. Playwright verifies real browser interactions separately.

GitHub Actions validates pull requests and pushes to `main`:

1. Install dependencies with `npm ci`.
2. Run tests.
3. Build the application.
4. Deploy to GitHub Pages on successful pushes to `main`.

Playwright E2E tests are not part of CI.

## Deployment

The application is configured for GitHub Pages:

https://elias-km.github.io/todo-react/

Vite uses `base: '/todo-react/'` to resolve production assets.

Deployment is triggered by a successful push to `main`, after GitHub Pages has been configured to use GitHub Actions.
