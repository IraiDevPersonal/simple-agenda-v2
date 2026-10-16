# Navegación mensual con botones laterales

## Decisión

La agenda vuelve a mostrar el mes como texto visible y navegable mediante dos botones de icono: anterior a la izquierda y siguiente a la derecha, pegados al nombre del mes. `Hoy` comparte esa fila y queda alineado al extremo derecho; `Mes visible` funciona como etiqueta contextual encima.

## Motivo

La selección directa con botones comunica mejor el recorrido temporal de una agenda y evita abrir un menú nativo para una acción que normalmente se realiza de forma secuencial. La simetría visual de los botones laterales conserva el lenguaje de bordes y targets táctiles de la interfaz. Mantener `Hoy` en la misma fila evita devolverlo al hero y agrupa las acciones temporales.

## Comportamiento

Ambos botones actualizan el search param `?date=` mediante la función pura `shiftMonth`. El día seleccionado se conserva cuando existe en el mes destino y se ajusta al último día válido cuando no existe. La fila de días continúa usando sus propios controles para navegar semanas.
