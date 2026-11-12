# Capturas publicitarias de ToDo IA

Captura estados reales de la interfaz de `todo-hyperframes` mediante Playwright, sin modificar `src/`. Los datos de las tareas, categorías y traducciones son **fixtures ilustrativas**: no implican que se esté ejecutando Gemini Nano durante las capturas.

## Preparación

Desde la raíz del repositorio (donde está `package.json`), con dependencias instaladas:

```bash
npm ci
npx playwright install chromium
npm pkg set 'scripts.capture:promo=node hyperframes/capture/capture.mjs'
npm run capture:promo
```

El script inicia y cierra temporalmente Vite en el puerto `5190`, sin depender de GitHub Pages. La salida queda en `hyperframes/promo/assets/captures/` con un `manifest.json`; las tomas `*-card.png` son recortes de la interfaz para integrarlos en las composiciones de HyperFrames.

**Antes de ejecutar:** haber inicializado `hyperframes/promo` con el CLI de HyperFrames. Si la carpeta `promo` ya existe, no la reinicialices ni sobrescribas su `index.html`.

## Qué se captura

13 escenas: vista general, relación tarea-categoría, filtro resaltado, filtro aplicado, tres temas, modal de alta, idioma inglés, selección múltiple, eliminar, deshacer, lista vacía y móvil.

Estas son **imágenes estáticas**. La generación real de tareas con Gemini Nano y las animaciones dinámicas de filtros requieren una fase aparte con Chrome compatible y grabación de interacciones genuinas.

## Aislamiento y seguridad

- Una instancia Vite local y contextos Playwright nuevos por escenario.
- `localStorage` aislado: claves `todo-ia:todos`, `todo-ia:language` y `todo-ia:theme`, conservadas del proyecto original.
- El modo de captura declara la Prompt API no disponible y cierra el diálogo mediante la UI; nunca pide descargar modelos ni pretende ejecutar inferencia.
- Los recursos se generan únicamente bajo `hyperframes/promo/assets/captures/`.
- Si cambia el texto de botones o la estructura de componentes, adaptar el script basándose en el DOM real; no usar selectores que aparenten una operación sin comprobarla.
