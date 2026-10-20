# Alineación de iconos del campo de hora · 2026-10-20

## Síntoma

El campo de hora combinaba un reloj visual a la izquierda con el indicador
nativo del navegador a la derecha. Su tamaño y posición podían variar entre
navegadores, haciendo que los dos relojes se percibieran desalineados.

## Corrección

Se mantiene el input `type="time"` para conservar su semántica y selector
nativo, pero se oculta visualmente el indicador WebKit y se dibuja un segundo
icono controlado por la interfaz. Ambos iconos usan el mismo tamaño, eje
vertical y `pointer-events: none`; el input sigue recibiendo el clic y el foco.
