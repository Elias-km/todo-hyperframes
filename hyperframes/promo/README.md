# ToDo IA — vídeo promocional / HyperFrames

Spot comercial de **30 segundos**, **1920×1080**, **30 fps**, composición **HTML + GSAP + HyperFrames**. Arquitectura autónoma, separada de `src/`.

## Requisitos

- Node 22+, FFmpeg, HyperFrames CLI.
- Capturas generadas previamente por `hyperframes/capture/capture.mjs` desde el repositorio **todo-hyperframes**.
- No se presupone que Gemini Nano esté disponible: el vídeo utiliza capturas reales de la UI con datos de demostración almacenados localmente. La escena de generación menciona la capacidad de IA, no representa un resultado de inferencia grabado en vivo.

## Ejecución (desde la raíz del repositorio)

```bash
npm run capture:promo
cd hyperframes/promo
node scripts/preflight.mjs
npx hyperframes lint
npx hyperframes preview
# En otra terminal, desde hyperframes/promo:
npx hyperframes render --output todo-ia-promo.mp4
```

Si no tienes el comando `capture:promo`:

```bash
node hyperframes/capture/capture.mjs
```

Las capturas deben quedar en `hyperframes/promo/assets/captures/`. Si el script falla, no edites los HTML para ocultar el error: corrige primero la captura.

## Guion / montaje

| Tiempo | Escena | Captura | Mensaje |
|---|---|---|---|
| 0–3 s | Arranque | Visual original | ToDo IA / Tu productividad amplificada |
| 3–7 s | Lista | `01-overview-light` | Menos caos, más foco |
| 7–11 s | IA | `01-overview-light` | Ideas que suman |
| 11–15 s | Filtros | `02-selected-category`, `04-filtered-tasks` | Encuentra lo que importa |
| 15–19 s | Inglés | `08-english-translation` | Your tasks. Tu idioma |
| 19–23 s | Edición | `09-multi-selection`, `11-after-undo` | Cambia de idea, sin miedo |
| 23–27 s | Temas | `05-dark-theme`, `06-radioactive-theme` | Cambia el chip |
| 27–30 s | Cierre | Tipografía animada | Hazlo realidad |

La **música y los efectos incluidos son originales**, sintetizados para este proyecto; pueden sustituirse por pistas con derechos de uso adecuados. Las transiciones principales están sincronizadas con el pulso de **120 BPM**.

## Calidad / límites

- Este paquete es una **primera edición técnica**, no un render visual aprobado: comprobar con `lint`, `preview` y un MP4 real antes de publicar.
- `index.html` es una composición HyperFrames, **no sustituye** el `index.html` de React en la raíz.
- La dependencia GSAP se carga desde jsDelivr. Para renderizado totalmente desconectado, se debe instalar una copia local autorizada.
- Para añadir una demostración real de la inferencia, grabar una toma dedicada en Chrome compatible, y ajustar la escena 3 sin simular resultados.
- Salida MP4 no forma parte de la app hasta que se revise y se integre expresamente.
