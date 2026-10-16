# Selector de mes para la agenda

## Decisión

La agenda usará un `<select>` nativo para elegir el mes visible. El control recibe opciones generadas desde una ventana de 25 meses centrada en la selección actual y mantiene el día seleccionado al cambiar de mes.

## Motivo

Un selector nativo conserva navegación por teclado y comportamiento familiar en dispositivos móviles sin introducir una dependencia adicional. Su apariencia se adapta al sistema visual existente con los tokens de superficie, línea, tipografía display, radio redondeado, foco visible e iconografía de calendario.

La navegación semanal permanece en la fila de días porque cambia la fecha concreta; la selección mensual reemplaza únicamente los controles que cambiaban de mes. La URL continúa siendo la fuente de verdad de la fecha mediante `?date=`.

## Límites

Esta iteración no agrega persistencia ni cambia la generación de bloques, las citas dummy o la integración futura con Supabase.
