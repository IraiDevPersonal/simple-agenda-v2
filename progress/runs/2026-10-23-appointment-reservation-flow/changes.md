# Cambios

- Se reemplazó el estado ambiguo `reserved` por `pending` y `confirmed`,
  manteniendo `blocked` como estado de disponibilidad profesional.
- Se agregaron acciones de Zustand para crear, confirmar y cancelar citas. Una
  cancelación elimina la ocupación del bloque y lo devuelve a `available`.
- Las reservas nuevas consultan el plazo configurado en Pagos: con plazo mayor
  que cero quedan pendientes; sin comprobante quedan confirmadas de inmediato.
- Se agregó `ReservationDialog`, un panel inferior en mobile y modal centrado en
  escritorio, con foco inicial, cierre por Escape, trampa de foco y retorno del
  foco al cerrar.
- El diálogo ahora guía la reserva en tres pasos: datos del paciente con
  búsqueda por RUT, revisión de tarifa/modalidad/costo y carga opcional de
  comprobante PDF o imagen.
- Se integró React Hook Form con `@hookform/resolvers` y Zod para validar el
  formulario del paciente. El RUT se formatea, valida con dígito verificador
  chileno y se busca con debounce; los demás campos permanecen deshabilitados
  hasta terminar la búsqueda.
- El stepper se simplificó a tres barras de progreso con el nombre del paso
  debajo y el modal mobile ahora usa todo el ancho interior disponible sin
  perder el margen exterior.
- El paso de comprobante incorpora un botón `Volver` hacia el resumen de la
  cita. Si se regresa después de reservar, el resumen queda en modo lectura y
  continuar vuelve al comprobante sin duplicar la reserva.
- Las cards disponibles ahora son el trigger completo de la reserva y ya no
  muestran un botón redundante. Se eliminó el mensaje de espacio disponible,
  se acercó el término al encabezado, se incorporó la modalidad en la misma
  fila del paciente y las citas ocupadas muestran el nombre del paciente con
  avatar de iniciales.
- Las acciones de cancelar y confirmar ahora usan iconos compactos con
  etiquetas accesibles. Las reservas con comprobante incluyen un enlace para
  revisarlo o descargarlo; las demos usan un comprobante visual local.
- Se agregó un directorio local de pacientes demo y el store puede reutilizar
  pacientes por RUT, guardar la cita y registrar el nombre del comprobante.
- Las tarjetas de agenda mantienen acciones compactas de `Confirmar` y
  `Cancelar`; las disponibles funcionan como trigger completo y muestran
  etiquetas textuales para cada estado.
- Se añadieron ejemplos para el 20 de noviembre: una cita presencial
  confirmada, una remota pendiente de comprobante, una cita a domicilio
  confirmada y un bloque remoto disponible.
- Se añadieron pruebas para los estados, el formulario por pasos, la búsqueda
  de pacientes, carga de comprobante y el ciclo crear-confirmar-cancelar.
- Se cambió el encabezado de bloques a `Mi agenda` y se añadieron filtros
  clickeables por cada estado, con iconos compactos y etiquetas expandibles en
  mobile.
- Se mantuvo el tratamiento visual previo de los filtros: chips pequeños,
  texto en caja normal y contador junto al indicador de estado.
- El encabezado usa `flex-wrap` antes del layout de escritorio en `md`, para
  que el título y los filtros compartan fila cuando el ancho disponible lo
  permite, especialmente en mobile.
- En mobile los filtros pasan a una fila propia alineada a la izquierda; los
  avatares fijan `leading-none` para centrar verticalmente sus iniciales.
- La modalidad de atención pasó a la cabecera, junto al estado, para dejar el
  pie de las cards ocupado solo por el paciente y las acciones. Los bloques
  disponibles ahora omiten el pie cuando no tiene contenido.
- Se separó la estructura visual en cabecera, cuerpo y pie: la duración y el
  término pasaron al cuerpo, manteniendo la cabecera compacta en grillas de
  varias columnas y conservando el pie para paciente y acciones.
- Las cards disponibles ahora conservan el pie con una acción de ancho completo
  (`Agendar paciente`), reemplazando el trigger de card completa y equilibrando
  la altura visual de la grilla sin anidar botones.
- Los tests de flujo completo de reserva tienen un timeout de 10 segundos para
  tolerar la ejecución conjunta de todos los escenarios en jsdom.
- El botón `Agendar paciente` se integró visualmente al borde inferior de la
  card como barra de acción, eliminando la apariencia de control flotante; el
  footer agrega `p-1` y el botón usa el radio de la card para marcar la
  separación sin perder integración. El footer conserva el fondo de la card,
  mientras el botón usa el fondo sutil y un radio inferior calculado como
  `var(--radius-card) - 0.25rem`.
- El footer de las cards disponibles usa `mt-auto` y cada elemento de la grilla
  ocupa `h-full`, manteniendo el botón alineado al borde inferior de sus cards
  vecinas aunque tengan estados o contenido con alturas distintas.
- Los footers comparten `min-h-14` y el disponible ya no usa márgenes negativos,
  por lo que los dividers respetan el mismo padding lateral y la misma altura
  interna en todos los estados.
- La acción de disponibilidad se redujo a un `IconButton` con `+`, alineado a
  la derecha y con el mismo footer estructural que las cards ocupadas.
- El body ahora es flexible y usa `mt-4`/`pb-4`; el footer comparte `min-h-14`,
  `pt-3` y el mismo divisor, evitando que una card disponible quede más baja o
  que el divider se pegue al contenido.
- Se añadió `blockedDates` al store temporal para modelar `Bloquear día` como
  excepción de fecha. Las citas existentes no se modifican; los espacios libres
  se proyectan como `Bloqueado` mientras la fecha está bloqueada y la acción es
  reversible.
- Los avatares usan centrado flex explícito y `leading-none` para alinear
  verticalmente las iniciales.
- Las cards disponibles agregan un candado a la izquierda para bloquear un
  bloque individual; el `+` de agendar se conserva a la derecha.
- Las cards bloqueadas eliminan el texto contextual `Tiempo bloqueado` y
  muestran únicamente `No disponible` centrado en el footer.
- El store agrega `blockSlot`/`unblockSlot` para representar bloqueos de un
  bloque concreto sin confundirlos con el bloqueo global de una fecha.
- Los bloques disponibles agrupan `Bloquear` y `Agendar` en un único grupo
  alineado a la derecha; los bloqueos manuales muestran `Desbloquear` junto a
  `No disponible`, mientras que el bloqueo global conserva su control en el
  encabezado del día.
- Las citas confirmadas ahora exponen `Reagendar` y las pendientes mantienen
  `Cancelar`. El reagendamiento abre un diálogo accesible con selector de fecha
  y horarios compatibles; la cita original se conserva hasta confirmar el
  nuevo horario y el store rechaza destinos ocupados o bloqueados.
- El selector de mes muestra centrado bajo el mes el rango compacto de la
  semana visible (`Semana del 16 al 22`); el encabezado de `Mi agenda` queda
  reservado para la fecha seleccionada y sus acciones.
- Se validó la composición en el navegador integrado y se añadieron pruebas
  para desbloqueo individual, reagendamiento, bloqueo de destinos y rangos
  semanales.
