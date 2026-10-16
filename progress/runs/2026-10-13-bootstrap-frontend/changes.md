# Cambios

- Bootstrap Vite con React 19.3, React Compiler, TanStack Router v1, Tailwind v4, Zustand y Vitest.
- Rutas `/`, `/agenda` y `/horarios`; la fecha de agenda se valida desde `?date=`.
- Modelos de jornada, citas y bloques; generador puro de slots de 45 minutos.
- Estado dummy editable para activar días, agregar, editar, eliminar y restaurar tramos.
- UI responsive con tokens semánticos, navegación mobile, tarjetas de slots y editor inline.
- Formulario de guardado demo bloqueado mientras existan tramos inválidos.
- AGENTS, agentes por rol, memoria `progress/` y harness `new-run`/`validate-run`.
- Se corrigió el warning de Fast Refresh separando el layout raíz en `root-layout.tsx`.
