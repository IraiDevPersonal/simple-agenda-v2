# Decisión: hover presionado sin desplazamiento

## Contexto

La sombra sólida de la tarjeta representa su elevación permanente. El hover
anterior combinaba esa sombra con un desplazamiento hacia arriba y una sombra
más corta, mezclando dos metáforas: levantar y presionar.

## Decisión

Eliminar el desplazamiento vertical del hover y conservar únicamente la
reducción de `shadow-action` a `shadow-action-hover`. La tarjeta permanece en
su sitio y el cambio de sombra comunica que el cursor la está presionando.

## Consecuencia

La interacción visual es más coherente con el botón “Hoy” y no provoca saltos
de posición en las filas de la grilla.
