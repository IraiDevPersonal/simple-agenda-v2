# Reagendamiento entre modalidades · 2026-11-27

## Contexto

El reagendamiento sólo ofrecía bloques de la misma modalidad para proteger la
coherencia entre la cita y su tarifa. Esa restricción ocultaba bloques válidos
de otras modalidades y no expresaba la decisión que el profesional puede tomar
al mover una cita.

## Decisión

El diálogo muestra un filtro de modalidad con "Todas las modalidades" como
valor inicial. Sólo aparecen las modalidades con un importe configurado en la
tarifa actual de la cita; no se elige otra tarifa automáticamente. La tarifa se
resuelve por identificador y, para los fixtures antiguos, por nombre.

El control "Mantener precio actual" comienza desactivado. Cuando está activo,
el profesional absorbe cualquier diferencia y la cita se reagenda directamente
conservando su importe. Cuando está desactivado, se aplica el importe de la
modalidad destino. Un importe menor o igual se aplica directamente; si es mayor
y la configuración global exige comprobante, la cita vuelve a pendiente, se
actualiza el plazo y se limpia el comprobante anterior. Si la configuración no
exige comprobante, se respeta esa configuración.

La operación de la tienda valida nuevamente que la cita siga confirmada, que
la fecha no esté bloqueada y que el bloque no haya sido tomado. No se envían
notificaciones reales en esta fase; el estado pendiente representa la solicitud
de pago dentro del frontend demo.

## Alcance

El cambio se limita al flujo de reagendamiento, al cálculo compartido de
precios por modalidad y a sus pruebas. No agrega selección de tarifas, pagos
reales, notificaciones ni cambios al configurador de precios.
