# Acción incremental para bloques · 2026-10-20

> Esta decisión fue reemplazada por
> `2026-10-20-eliminar-bloques-individuales.md`: la interacción actual usa
> chips removibles y conserva huecos intermedios.

## Decisión

El editor ya no expone un input numérico para la cantidad de bloques. La
cantidad se conserva en `ScheduleSegment.blockCount` y se modifica desde un
grupo de botones `−` y `+` situado junto a la vista previa de horarios.

## Comportamiento

- Cada pulsación agrega un bloque fijo de 45 minutos.
- El botón `−` elimina únicamente el último bloque.
- La hora final y el resumen se recalculan inmediatamente.
- El contador permanece visible como `N bloque(s)`, sin la etiqueta “exactos”.
- El último bloque no se puede eliminar para conservar una configuración válida.
- El botón se desactiva cuando el siguiente bloque cruzaría la medianoche.
- El control mantiene un target táctil de 44px y un nombre accesible.

## Motivo

Los bloques de un tramo son consecutivos y el modelo solo guarda su cantidad.
Eliminar un bloque intermedio exigiría representar huecos o convertir el
tramo en varias configuraciones, por lo que se reserva esa evolución para un
modelo de excepciones futuro.
