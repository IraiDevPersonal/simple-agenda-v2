# Cambios

- `ScheduleSegmentEditor` usa un botón accesible `Añadir bloque` junto a la
  vista previa de chips.
- Cada pulsación incrementa `blockCount` en uno y recalcula la hora final.
- Se retiró el input de cantidad de bloques.
- El contador conserva la cantidad, pero ya no muestra “exactos”.
- El botón se desactiva si el siguiente bloque cruzaría la medianoche.
- Se añadió una prueba de componente para la nueva interacción.
