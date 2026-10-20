# Cambios

- Se creó `AppSelect` como primitiva reutilizable con `appearance: none` y una
  flecha SVG propia alineada a la derecha.
- Se agregó la variante progresiva `appearance: base-select` para estilizar el
  picker y sus opciones cuando el navegador la soporta.
- El panel usa borde oscuro, radio, sombra de acción y fondo de superficie; la
  opción activa usa el acento lima y el hover usa el acento suave.
- La flecha rota al abrir únicamente cuando se respetan las animaciones; el
  fallback conserva el comportamiento nativo accesible.
