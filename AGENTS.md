# Simple Agenda · instrucciones de trabajo

## Objetivo actual

Construir primero un frontend React accesible y mobile-first para una agenda de profesionales. No integrar Supabase, React Query, auth ni persistencia hasta aprobar la fase visual.

## Reglas rápidas

- Consultar documentación oficial antes de agregar o actualizar librerías: [React](https://react.dev/), [TanStack Router](https://tanstack.com/router/latest), [Tailwind](https://tailwindcss.com/docs).
- Mantener las versiones actuales alineadas con sus APIs documentadas y registrar decisiones en `progress/`.
- Aplicar SOLID, DRY y KISS sin sobrearquitectura; mantener el dominio fuera de la UI.
- Componentes pequeños, composables, semánticos y accesibles. Evitar efectos innecesarios, componentes definidos dentro de otros y barrel imports.
- Usar `kebab-case` en archivos y carpetas, salvo convenciones obligatorias como `AGENTS.md`, `README.md`, `__root.tsx` y `routeTree.gen.ts`.
- Mantener `pnpm typecheck`, `pnpm lint`, `pnpm test` y `pnpm build` en verde.
- Actualizar `progress/` después de una exploración, decisión, corrección o patrón relevante.

## Estructura

`src/routes` conecta URL; `src/features` contiene UI y dominio por capacidad; `src/components/ui` contiene primitivas; `src/stores` contiene estado temporal; `src/lib` contiene utilidades puras; `src/data` contiene fixtures.

## Coordinación

- [Leader](./agents/leader.md): alcance, arquitectura y coordinación.
- [Implementer](./agents/implementer.md): cambios acotados, tests y validación local.
- [Reviewer](./agents/reviewer.md): revisión de calidad, accesibilidad, UX y regresiones.
- [Workflow](./agents/workflow.md): secuencia para ejecutar tareas en paralelo y registrar memoria.

El harness de runs está en `scripts/harness/`; no invoca proveedores de modelos ni guarda credenciales.
