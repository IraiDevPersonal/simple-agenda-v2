# Decisión: ampliar la sombra junto con el levantamiento

## Contexto

La tarjeta ya tenía una sombra sólida permanente y un desplazamiento vertical
al hover. La sombra reducida del hover comunicaba presión, pero no acompañaba
la lectura de que la tarjeta se eleva.

## Decisión

Añadir el token `shadow-action-lift` de `5px 5px` y usarlo en hover junto con
`hover:-translate-y-0.5`. El estado base conserva `shadow-action` de `3px 3px`.

## Consecuencia

La sombra se extiende en la misma dirección que el movimiento de la tarjeta,
reforzando la profundidad sin cambiar la paleta ni introducir una sombra
difusa nueva.
