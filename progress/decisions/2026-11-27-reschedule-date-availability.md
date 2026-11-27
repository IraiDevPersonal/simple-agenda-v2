# Fechas y horarios válidos al reagendar · 2026-11-27

## Contexto

El diálogo de reagendamiento usaba el calendario nativo del navegador y
arrancaba en la fecha de la cita original. Además, mostraba un estado vacío
cuando la fecha actual todavía tenía bloques futuros, porque no descartaba
explícitamente sólo los horarios pasados.

## Decisión

El campo visible conserva el lenguaje de un input de fecha, pero abre el
componente reutilizable `DatePicker` de `src/components/ui`. El calendario se
renderiza en un portal fuera de contenedores con scroll, se reposiciona frente
al borde derecho del campo y se cierra al hacer clic fuera o presionar Escape.
La entrada usa una transición breve de opacidad y escala. Las fechas visibles
del mes siguiente permanecen seleccionables cuando están habilitadas. Así puede
deshabilitar fechas sin bloques de agenda y fechas anteriores a hoy sin quedar
amarrado al diálogo de reagendamiento. La fecha inicial siempre es la fecha
actual según `America/Santiago`.

Los horarios se filtran por fecha y hora actual antes de mostrarse; el diálogo
actualiza esa referencia cada minuto para no conservar horarios que se vuelvan
pasados mientras permanece abierto. Se conserva
la compatibilidad de modalidad existente: el reagendamiento no cambia la
modalidad ni el precio de una cita; por eso sólo ofrece bloques libres de la
misma modalidad.

## Alcance

El cambio está limitado al diálogo de reagendamiento y a utilidades puras de
fecha. No modifica la agenda principal ni convierte el reagendamiento en una
edición de modalidad o precio.
