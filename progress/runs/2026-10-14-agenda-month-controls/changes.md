# Cambios

- La cabecera mensual ahora usa `IconButton` para `Mes anterior` y `Mes siguiente`, flanqueando de forma compacta el mes centrado.
- `Hoy` comparte esa misma fila y queda alineado al extremo derecho.
- La etiqueta `Mes visible` queda como contexto encima de la fila de controles.
- Los botones mensuales reutilizan `shiftMonth`, conservan el día y ajustan el último día válido del mes destino.
- Se eliminaron `MonthSelect`, sus pruebas, las utilidades de opciones de meses y el icono chevron dedicado.
- Se agregó una prueba de integración que valida las dos direcciones y el search param.
