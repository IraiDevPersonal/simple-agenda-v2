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

El comprobante puede no ser requerido o tener un plazo configurable de 1, 3, 6,
12 o 24 horas. La información se mantiene temporalmente en Zustand, igual que
el resto de la demo, hasta aprobar la fase visual y conectar persistencia.
