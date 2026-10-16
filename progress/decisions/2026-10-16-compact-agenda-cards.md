# Decisión: profundidad compartida para tarjetas y acción principal

## Contexto

La tarjeta vertical anterior mejoró la jerarquía, pero seguía siendo más alta
de lo necesario y usaba una sombra difusa distinta al botón “Hoy”. La
referencia visual del producto usa bordes firmes y una sombra sólida desplazada
para dar sensación de objeto elevado.

## Decisión

Compactar la tarjeta sin eliminar información y reutilizar los tokens
`shadow-action` y `shadow-action-hover` ya definidos para el sistema visual.
La tarjeta conserva `hover:-translate-y-0.5`, igual que el botón principal, y
enumera explícitamente las propiedades de transición.

## Consecuencias

- Las filas muestran más bloques del día con menos desplazamiento vertical.
- La agenda tiene una firma visual más coherente entre acciones y contenido.
- La sombra sólida comunica elevación sin añadir una nueva variante de token.
- La tarjeta sigue siendo un elemento informativo; el efecto no introduce una
  acción ni cambia el modelo de interacción.
