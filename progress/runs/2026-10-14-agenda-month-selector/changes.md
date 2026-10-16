# Cambios

- Se agregó `MonthSelect`, un control nativo accesible con iconos, borde grueso, sombra de contorno y tokens de la UI.
- Se agregó una ventana de 25 meses centrada en el mes seleccionado.
- Al cambiar de mes se conserva el día seleccionado y se ajusta al último día válido cuando el mes es más corto.
- `Hoy` ahora está junto al selector mensual.
- Se retiraron `Mes anterior` y `Mes siguiente`; la navegación semanal de `DateStrip` no cambia.
- Se agregaron pruebas para la conversión fecha/mes, opciones de meses y selección del control.

## Estado

Este enfoque fue una exploración visual y quedó descartado en la siguiente iteración. La interfaz final volvió a botones de mes laterales.
