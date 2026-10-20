# Cambios

- Se añadió `ScheduleBlockChip`, un botón nativo que elimina el bloque cuyo
  horario muestra.
- Se añadió `excludedBlockIndexes` a `ScheduleSegment`.
- `getScheduleBlocks` centraliza el cálculo de bloques disponibles para el
  editor y la agenda.
- El generador de agenda omite los bloques retirados sin mover los siguientes.
- El contador semanal y el resumen del tramo cuentan solo bloques disponibles.
- Se eliminó el botón `−`.
