# Composición mobile del editor de tramos · 2026-10-20

## Decisión

En mobile, el editor prioriza una lectura vertical: hora de inicio primero,
modalidad después y eliminar alineado a la derecha de la modalidad. En
breakpoints amplios, los mismos controles vuelven a formar una fila mediante
`sm:contents`, sin duplicar la estructura.

La vista previa es un grupo semántico con el título visible “Bloques de 45
min”, los horarios de inicio debajo y el botón `+` asociado al grupo.

## Motivo

La acción destructiva deja de ocupar una fila aislada y se libera espacio
vertical. El título evita que los chips de hora parezcan datos sin contexto y
el botón queda junto a la información que modifica.
