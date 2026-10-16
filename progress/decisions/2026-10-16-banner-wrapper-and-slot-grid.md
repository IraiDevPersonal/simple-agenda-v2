# Banners descartables y grilla de agenda

## Decisiones

- Los banners de Agenda y Horarios comparten `BannerWrapper`.
- La visibilidad se mantiene con estado React local, sin `localStorage` ni backend, porque la fase actual no incluye persistencia.
- El componente acepta contenido como `children`, `tone`, etiquetas accesibles y clases adicionales para mantenerlo reutilizable.
- La lista de slots conserva `<ul>` y `<li>` por semántica, pero elimina el contenedor visual que agrupaba las tarjetas.
- La grilla usa una columna por defecto, dos desde `md` y tres desde `lg`; tres columnas es el máximo.

## Accesibilidad

Los controles de cierre usan un botón nativo de 44px con `aria-label`, el icono es decorativo y el control para restaurar el banner tiene texto visible. Los títulos de las tarjetas usan hasta dos líneas para evitar perder información en columnas estrechas.
