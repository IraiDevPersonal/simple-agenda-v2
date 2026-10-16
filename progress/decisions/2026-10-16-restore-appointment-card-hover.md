# Decisión: conservar el levantamiento del hover

## Contexto

Se probó una variante de la tarjeta que reducía la sombra al hover sin mover
la tarjeta. Después de revisarla, se decidió que la versión con desplazamiento
vertical comunica mejor el efecto visual buscado para este producto.

## Decisión

Conservar `hover:-translate-y-0.5` junto con la reducción de sombra
`shadow-action-hover`. La tarjeta mantiene la compactación y la elevación base
de la iteración anterior.

## Consecuencia

La interacción visual vuelve a priorizar el efecto de levantamiento solicitado,
sin alterar contenido, estados ni comportamiento funcional.
