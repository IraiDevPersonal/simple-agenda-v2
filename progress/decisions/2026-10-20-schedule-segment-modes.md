# Modalidad por tramo horario

## Decisión

Cada `ScheduleSegment` tiene una modalidad de atención: `remote`, `in-person` o
`home-visit`. El editor expone las etiquetas Remoto, Presencial y A domicilio.

## Motivo

Una jornada partida puede tener condiciones distintas en cada tramo. Mantener
la modalidad en el tramo permite representar esa diferencia ahora sin diseñar
todavía la configuración global del profesional. Más adelante, las opciones del
editor podrán derivarse de las modalidades habilitadas por el usuario.

## Tramos nuevos

Al crear un tramo se toma el último tramo activo del día como referencia. El
nuevo inicio es su hora final y la modalidad se hereda para reducir trabajo
repetido. Si no hay una referencia válida, se usan 09:00 y Presencial.
