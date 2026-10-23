# Configuración inicial de pagos

## Decisión

Se agrega la ruta `/pagos` para que el profesional configure tarifas de
atención, plazo de envío del comprobante y datos de transferencia. No se
incorpora una pasarela de pagos ni el flujo de confirmación de citas todavía.

Cada tarifa se modela de forma independiente con un nombre comercial y una o
más modalidades de atención (`Presencial`, `Remoto` o `A domicilio`). Cada
modalidad activa tiene su propio valor en pesos chilenos. La tarifa también
puede activar una opción con un valor común propio; al hacerlo, los valores
individuales quedan bloqueados y se sincronizan con ese valor en las
modalidades activas.

La edición visual agrupa cada tarifa en una tarjeta compacta: el nombre y la
eliminación quedan en la cabecera, mientras que las modalidades se muestran en
una grilla responsive con switch, nombre y valor alineados. En mobile la grilla
colapsa a una columna sin introducir desplazamiento horizontal.

La representación de tarifas evoluciona a un resumen compacto con expansión
por tarifa. Cada resumen mantiene visibles el nombre, las modalidades activas
y sus precios; los switches, inputs, precio común y eliminación permanecen en
el panel de edición accesible mediante un botón con `aria-expanded`.
El indicador de expansión se ubica como una pestaña absoluta en el borde
izquierdo de la tarjeta para separar visualmente la acción de abrir de la
acción destructiva de eliminar.

Después de revisar la jerarquía visual, el indicador dejó de sobresalir del
borde: ahora vive dentro de la cabecera, antes del nombre, como un control
compacto de estado. Así mantiene la cabecera completa clickeable sin competir
con el botón de eliminar ni generar un elemento visual cortado.

En una revisión posterior, el chevron se movió al extremo derecho de la
cabecera, ocupando el lugar natural de la acción de expansión. La eliminación
volvió junto al nombre de la tarifa dentro del panel abierto, evitando mezclar
una acción destructiva con el resumen colapsado. Los switches usan un pulgar
posicionado con lados y centrado verticalmente para mantener una geometría
estable en desktop y mobile.

El acordeón usa una transición de `grid-template-rows` y opacidad para animar
la altura real del contenido sin depender de un `display: none`. Al cerrarse,
el panel queda inerte y oculto para tecnologías de asistencia y teclado; el
chevron comparte duración y respeta `prefers-reduced-motion`.

El comprobante puede no ser requerido o tener un plazo configurable de 1, 3, 6,
12 o 24 horas. La información se mantiene temporalmente en Zustand, igual que
el resto de la demo, hasta aprobar la fase visual y conectar persistencia.

La configuración se separa en dos formularios independientes: tarifas y
confirmación de pago. Cada uno tiene su propio guardado y mensaje de estado; el
botón de restauración sigue actuando como reinicio global de la demo.

El pie de acciones de confirmación mantiene el mensaje separado de los
botones hasta desktop para evitar que se compriman en anchos intermedios. Las
acciones ocupan el ancho disponible en mobile y tablet, conservan sus textos
en una sola línea y pasan a una fila compacta desde `lg`.
