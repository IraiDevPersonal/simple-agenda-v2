# Etiquetas de botones sin saltos de línea

## Decisión

Los botones de la aplicación mantienen sus etiquetas en una sola línea cuando
existe espacio disponible. `AppButton` aplica `whitespace-nowrap` como regla
base para evitar que una acción como “Añadir tarifa” o “Guardar pagos” se
parta visualmente.

Cuando varias acciones no caben, el contenedor debe resolver el problema con
`flex-wrap`, una composición apilada o un cambio de breakpoint; el texto del
botón no debe comprimirse. Los grupos de acciones conservan además su ancho
natural y se alinean de forma consistente con el borde derecho de su sección.
