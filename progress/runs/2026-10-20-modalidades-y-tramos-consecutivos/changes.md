# Cambios

- `ScheduleSegment` ahora incluye `serviceMode` con las opciones `remote`,
  `in-person` y `home-visit`.
- El editor muestra un `<select>` nativo y accesible para Remoto, Presencial y
  A domicilio.
- `addSegment` calcula el inicio del nuevo tramo desde el fin del último tramo
  activo y hereda su modalidad; sin tramo previo usa 09:00 y Presencial.
- La lógica de sugerencias vive en `schedule-segment-utils.ts`, fuera de la UI.
- Las fixtures y pruebas existentes fueron actualizadas para el nuevo modelo.
