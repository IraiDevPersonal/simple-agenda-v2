# Días sin bloques deshabilitados en la agenda · 2026-11-27

## Contexto

La tira semanal permitía seleccionar las siete fechas aunque algunas no
generaran ninguna tarjeta en la agenda. La solicitud es comunicar esa ausencia
desde el propio selector.

## Decisión

La agenda calcula las fechas deshabilitadas a partir de los bloques que genera
la configuración de horarios para esa semana. No se usa únicamente la lista de
pacientes ocupados: un día con bloques libres sigue siendo una fecha válida
para reservar una nueva cita.

`DateStrip` aplica el atributo nativo `disabled` a las fechas sin bloques. Así
se conserva el comportamiento accesible del botón, el foco visible de las
fechas activas y la navegación semanal sin agregar estado de dominio nuevo.

## Alcance

El cambio sólo afecta la selección de días en `/agenda`. No cambia la
generación de bloques, las citas, la configuración de horarios ni la
navegación por semanas.
