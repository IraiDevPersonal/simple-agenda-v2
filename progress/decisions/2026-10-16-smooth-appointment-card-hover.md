# Decisión: transición de 300ms para el levantamiento

## Contexto

El hover de la tarjeta anima simultáneamente su desplazamiento y el tamaño de
la sombra sólida. Con `200ms`, el cambio se percibía brusco.

## Decisión

Usar `duration-300 ease-out` en la transición explícita de `transform`,
`box-shadow` y `border-color`. Se mantiene el desplazamiento pequeño y la
sombra `shadow-action-lift`.

## Consecuencia

El levantamiento se percibe como una sola acción más suave, sin agregar
dependencias ni cambiar la interacción funcional de la tarjeta.
