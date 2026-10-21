# Perfil profesional inicial

## Decisión

Se agrega la ruta `/perfil` para administrar en memoria los datos básicos del
profesional: nombres, apellidos, RUT, teléfono, correo, profesión y foto de
perfil.

La información se mantiene en un store Zustand separado del estado de agenda.
El formulario permite editar los datos, mostrar una previsualización local de
la imagen y restaurar los valores dummy. No se incorpora persistencia,
autenticación ni Supabase.

La profesión se elige desde una lista de opciones frecuentes. La opción
`Otra` muestra un campo adicional obligatorio y guarda el texto personalizado
en el mismo campo `profession`, evitando duplicar el modelo de datos.

## Próximos datos posibles

No se agregan más campos todavía. Cuando exista la configuración del negocio,
podría ser útil definir un nombre comercial, una breve presentación y la zona o
dirección de atención, especialmente para profesionales a domicilio.
