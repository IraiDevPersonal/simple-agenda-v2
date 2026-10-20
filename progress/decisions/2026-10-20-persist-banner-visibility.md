# Persistencia de visibilidad de banners

## Decisión

La visibilidad de cada `BannerWrapper` se conserva en `localStorage` con una
clave explícita por banner y un namespace versionado:
`simple-agenda:banner:v1:<storageKey>`.

## Motivo

El comportamiento solicitado es una preferencia visual local, no datos de
agenda. Persistir solamente el estado `hidden` evita introducir Zustand,
Supabase o una capa de persistencia de dominio antes de aprobar la fase visual.
El prefijo versionado permite cambiar el formato en el futuro sin interpretar
datos antiguos de forma incorrecta.

## Comportamiento de respaldo

El acceso al storage está protegido con `try/catch`. Si el navegador lo bloquea
o no lo ofrece, el banner sigue funcionando durante la sesión con estado en
memoria.
