# Decisión: composición vertical para tarjetas de agenda

## Contexto

La tarjeta anterior dividía el bloque en una columna lateral para la hora y
otra para el contenido. Ese patrón funcionaba en una lista ancha, pero en la
grilla de hasta tres columnas reducía demasiado el espacio disponible para el
título y el estado.

## Decisión

Usar una composición vertical reutilizable para cada tarjeta:

1. encabezado con hora, duración y estado;
2. cuerpo con el nombre o la descripción del bloque;
3. pie con el contexto y la hora de término.

La franja superior conserva una señal de color por estado, mientras que el
texto sigue siendo la fuente principal de significado. Cada tarjeta ocupa toda
la altura de su celda para que las filas de la grilla se perciban alineadas.

## Consecuencias

- En mobile la tarjeta es más fácil de escanear con una sola columna.
- En escritorio la grilla puede crecer hasta tres columnas sin perder jerarquía.
- La hora y la hora de término quedan visibles en posiciones estables.
- Si en el futuro se agrega una acción a la tarjeta, el encabezado y el pie ya
  ofrecen zonas claras para incorporarla sin mezclarla con el contenido.
