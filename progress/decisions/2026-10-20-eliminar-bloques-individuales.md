# Bloques removibles desde la vista previa · 2026-10-20

## Decisión

Cada horario de inicio se presenta como un chip accionable. El chip muestra
una `×` y al pulsarlo elimina exactamente ese bloque, incluso si está en medio
de la jornada.

## Modelo

`ScheduleSegment.blockCount` conserva la ventana temporal original de 45
minutos. `excludedBlockIndexes` guarda las posiciones retiradas dentro de esa
ventana. Esto permite que una jornada de `09:00`, `09:45`, `10:30` conserve
`09:00` y `10:30` cuando se retira `09:45`.

El generador de agenda reutiliza la misma función pura para omitir esos
bloques, y el resumen cuenta solo los bloques disponibles. El fin del tramo
continúa representando el final de la ventana configurada.

## UX y accesibilidad

- El chip completo es un botón nativo, no un `div` con click.
- Cada chip tiene un nombre accesible específico, por ejemplo:
  `Quitar bloque de las 09:45`.
- Se mantiene el botón `+` para extender la ventana por otro bloque de 45
  minutos.
- Si se retiran todos los bloques, la validación solicita añadir al menos uno
  antes de guardar.
- Los chips mantienen targets táctiles mínimos y foco visible.
