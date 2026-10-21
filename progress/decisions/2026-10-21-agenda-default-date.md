# Fecha seleccionada por defecto en la agenda

## Decisión

Cuando `/agenda` no recibe el search param `date`, la fecha seleccionada se
calcula con `todayDateKey()` usando la zona horaria `America/Santiago`. Si el
param está presente y es válido, se conserva como selección inicial.

## Motivo

La agenda debe abrirse en el día actual para que la primera vista sea útil y
coherente con la acción “Hoy”. Las fechas explícitas de la URL siguen siendo
reproducibles para enlaces, navegación y pruebas visuales.

## Alcance

Este cambio no escribe automáticamente `date` en la URL. El parámetro solo se
agrega cuando el usuario cambia la fecha mediante los controles de la agenda.
