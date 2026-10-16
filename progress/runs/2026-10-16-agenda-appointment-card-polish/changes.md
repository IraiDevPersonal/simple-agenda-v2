# Cambios

- `AgendaSlotCard` ahora usa una composición vertical: hora y estado en el
  encabezado, información de la cita en el cuerpo y metadatos en el pie.
- Se añadió una franja superior semántica para disponible, reservado y
  bloqueado, además de altura consistente y hover con transición explícita.
- La tarjeta mantiene títulos de hasta dos líneas, textos secundarios legibles,
  horas tabulares y metadatos que no provocan overflow.
- `StatusPill` evita que el nombre del estado se parta en varias líneas.
- No se modificó el dominio, el estado Zustand ni la integración de datos.
