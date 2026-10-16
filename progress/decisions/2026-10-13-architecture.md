# Decisiones de arquitectura · 2026-10-13

- La app comienza como SPA frontend; no hay Supabase, React Query, auth ni persistencia.
- La duración de cada bloque se modela con una sola constante de 45 minutos.
- `generateAgendaSlots` y la validación de jornadas son funciones puras para poder probarlas sin navegador.
- La fecha seleccionada se mantiene en `?date=YYYY-MM-DD` y se valida en la ruta `/agenda`.
- Zustand guarda solo fixtures editables en memoria. La UI deriva estadísticas y bloques desde ese estado.
- Tailwind v4 usa tokens semánticos `@theme`; no se añade `tailwind.config.*`.
- La estructura por features mantiene agenda y horarios independientes sin introducir capas innecesarias.
