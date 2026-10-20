# Cambios

- `BannerWrapper` ahora recibe una `storageKey` y guarda únicamente el estado
  oculto en `localStorage` bajo el namespace versionado
  `simple-agenda:banner:v1:`.
- Agenda y Horarios tienen claves independientes (`agenda-intro` y
  `schedule-intro`), por lo que ocultar uno no afecta al otro.
- Si el navegador bloquea `localStorage`, el componente conserva el estado en
  memoria y la interfaz continúa funcionando.
- Se añadió una prueba que desmonta y vuelve a montar el banner para validar la
  persistencia y la restauración.
