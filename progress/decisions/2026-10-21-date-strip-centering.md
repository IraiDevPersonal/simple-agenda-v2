# Centrado de la fecha activa

## Decisión

La tira semanal centra automáticamente el día seleccionado cuando cambia la
fecha o se carga la agenda, pero sólo cuando existe overflow horizontal. El
desplazamiento calcula la posición centrada y la limita entre el inicio y el
final real de la tira.

No se agregan espacios laterales artificiales: si el día seleccionado está en
un extremo, permanece en ese extremo y no deja un hueco visual. En mobile la
animación es suave y cambia a inmediata cuando el usuario prefiere reducir el
movimiento.
