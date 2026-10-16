# Patrones de frontend · 2026-10-13

- Los componentes visuales reciben callbacks y datos; los cálculos de fechas y horarios viven en `src/lib` o en la feature correspondiente.
- Las clases comunican estados con `data-state` y `data-slot` además de color.
- Los controles interactivos tienen nombres accesibles, foco visible y mínimo táctil de 44px.
- Las transiciones de navegación de agenda usan `useTransition`; el resultado de la navegación sigue siendo la fuente de verdad.
- Las validaciones inline se conectan con `aria-describedby`, `aria-invalid` y `role=alert`.
