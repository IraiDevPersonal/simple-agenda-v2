# Flujo mínimo de reservas

## Decisión

La primera versión del flujo mantiene cuatro estados visibles: `Disponible`,
`Pendiente`, `Confirmada` y `Bloqueado`. `Pendiente` solo aparece cuando la
configuración de Pagos exige comprobante; si no se exige, una reserva se marca
como confirmada inmediatamente.

La cancelación se modela como una acción que libera el bloque, en lugar de
mantener un estado activo adicional que el profesional deba gestionar. El
vencimiento automático del comprobante queda para una etapa con persistencia y
reloj de negocio; en esta fase visual el profesional puede cancelar la reserva
pendiente desde la tarjeta.

## Interfaz

Crear una reserva abre un panel contextual que funciona como bottom-sheet en
mobile y modal centrado en escritorio. El panel tiene tres pasos:

1. Identificar al paciente mediante RUT y completar nombres, apellidos, correo
   y teléfono. El formulario usa React Hook Form con un esquema Zod; al inicio
   solo se habilita el RUT, que se formatea y valida con el dígito verificador
   chileno. La búsqueda se dispara con debounce o con el ícono dentro del
   campo, y rellena los datos cuando existe una coincidencia.
2. Revisar paciente, horario, tarifa, costo, modalidad y plazo del comprobante.
3. Adjuntar opcionalmente un comprobante PDF o imagen; la reserva queda
   pendiente hasta que el profesional lo revise.

El indicador de pasos usa tres barras progresivas y etiquetas compactas (`Datos
paciente`, `Datos cita`, `Comprobante`). La interfaz muestra debajo de `Pasos`
solo el nombre del paso actual para reducir ruido visual. Desde el comprobante
se puede volver al resumen de la cita; ese retorno no vuelve a crear la reserva
y mantiene el comprobante seleccionado.

En mobile el modal conserva el margen exterior y ocupa todo el ancho disponible
dentro de él.

Las cards de agenda disponibles mantienen el mismo pie que el resto, pero usan
una acción compacta de ícono (`+`) alineada a la derecha para agendar paciente.
La hora, modalidad y estado viven en la
cabecera, con la modalidad inmediatamente a la izquierda del estado. La
duración y la hora de término se agrupan en el cuerpo para que la cabecera no
se comprima en grillas de varias columnas. Las cards ocupadas reservan el pie
para el paciente y las acciones; las citas muestran el paciente con sus
iniciales. Las acciones de gestión se reducen a iconos con nombre accesible; una
reserva pendiente con comprobante expone además un enlace para revisarlo o
descargarlo.

Las tarjetas gestionan el resto del ciclo con acciones directas: `Confirmar`
solo queda disponible cuando hay un comprobante adjunto y `Cancelar` libera el
horario.

La cabecera de la agenda usa el título `Mi agenda` y cuatro filtros directos,
uno por estado (`Disponibles`, `Pendientes`, `Confirmadas` y `Bloqueadas`). En
escritorio muestran etiqueta y contador; en mobile se reducen a icono y
contador, expandiendo la etiqueta al interactuar. El mismo control alterna el
filtro activo y vuelve a mostrar todos los bloques.

Bloquear un día es una excepción temporal de disponibilidad a nivel de fecha,
no una cita ni un cuarto estado persistido del dominio. Al activarlo, los
espacios disponibles de esa fecha se representan visualmente como bloqueados;
las citas existentes se conservan y el control permite revertir la acción.

Todas las cards comparten un wrapper flex con tres secciones (`header`, `body`,
`footer`). El cuerpo ocupa el espacio flexible y reserva padding inferior para
que el divisor mantenga el mismo inset que el resto de la card; el footer usa
una altura mínima común para alinear acciones entre estados.

El bloqueo de un bloque disponible se ejecuta desde la propia card mediante un
candado a la izquierda y conserva el `+` de agendar a la derecha. El bloqueo
individual se registra como una cita técnica con estado `blocked`, mientras que
el pie de una card bloqueada muestra `No disponible` a la izquierda y un
desbloqueo a la derecha cuando el bloqueo fue creado desde esa card. Los
bloqueos globales de fecha se revierten desde el encabezado.

Las citas confirmadas usan `Reagendar` en lugar de `Cancelar`. El flujo abre un
diálogo con fecha y horarios disponibles de cualquier día; el cambio conserva
la cita original hasta que el profesional confirma el destino. Las citas
pendientes mantienen `Cancelar` porque todavía están esperando comprobante.

El selector de mes muestra el rango de la semana visible centrado debajo del
mes y año (`Semana del 16 al 22`), sin repetir el nombre del mes. La fecha
seleccionada queda limpia dentro del encabezado de `Mi agenda`.

## Fuera de alcance

No se integra todavía almacenamiento binario real de comprobantes,
notificaciones, expiración automática, autenticación ni persistencia de citas o
pacientes. La implementación usa el store temporal de Zustand que ya utiliza la
demo y conserva solo el nombre del archivo adjunto.
