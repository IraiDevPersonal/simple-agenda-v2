# Simple Agenda

Frontend mobile-first para profesionales que necesitan ordenar su disponibilidad y sus citas. Esta primera fase se concentra en la experiencia visual de la agenda y la configuración de jornadas; los datos viven en Zustand y se reinician al recargar.

## Stack

- React 19.3 + TypeScript + React Compiler.
- Vite 8 + pnpm.
- TanStack Router v1 con rutas basadas en archivos.
- Tailwind CSS v4 con configuración CSS-first.
- Zustand para estado dummy en memoria.
- Vitest + Testing Library para lógica y componentes.

## Desarrollo

```bash
pnpm install
pnpm dev
```

Quality gates:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

También se puede ejecutar todo con `pnpm verify`.

## Rutas

- `/agenda`: navegación por mes y semana, bloques de 45 minutos y estados de las citas.
- `/horarios`: activación de días, tramos, cantidad de bloques, validación y vista previa.
- `/`: redirección a `/agenda`.

## Arquitectura

La lógica de dominio vive en `src/lib` y en las funciones de cada feature. Las rutas solo conectan URL y pantalla; los componentes visuales reciben datos y callbacks; Zustand mantiene el estado temporal de demo. La estructura completa y las reglas de colaboración están en [AGENTS.md](./AGENTS.md).

El generador de bloques es puro y usa una única constante de duración: `SLOT_DURATION_MINUTES = 45`. Supabase, React Query, autenticación y persistencia quedan fuera de esta etapa.

## Harness de trabajo

Cada iteración puede iniciar un run con:

```bash
pnpm harness:new "nombre de la iteración"
pnpm harness:validate progress/runs/<run>
```

El historial de exploraciones, decisiones, bugs y patrones se guarda en [`progress/`](./progress/).
