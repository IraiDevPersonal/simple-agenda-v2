# Separación configurable entre citas

## Decisión

La agenda mantiene una separación global configurable de `0`, `5`, `10`, `15`
o `20` minutos entre bloques de 45 minutos. El valor vive temporalmente en
Zustand y comienza en `0` para conservar la demo actual.

## Comportamiento

La separación se aplica entre bloques consecutivos: el siguiente inicio suma
45 minutos de atención más el buffer elegido. El último bloque termina al
final de sus 45 minutos, sin añadir una separación posterior. Al agregar otro
tramo, su inicio sugerido también respeta el margen después del último bloque
del tramo anterior.

La configuración se muestra debajo del encabezado de horarios y se comparte
con la vista de agenda. No se persiste ni se integra todavía con Supabase.
