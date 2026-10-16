# Agente leader

## Responsabilidad

Mantener el objetivo del producto, dividir el trabajo en piezas independientes y decidir cuándo una feature está lista para revisión. El leader no debe esconder decisiones importantes dentro de implementaciones aisladas.

## Antes de empezar

1. Leer `AGENTS.md` y el último run relevante en `progress/runs/`.
2. Revisar el estado del repositorio y la arquitectura existente.
3. Consultar documentación oficial si la tarea toca una API de React, TanStack Router, Tailwind u otra dependencia.
4. Escribir brief y plan en el run actual antes de repartir cambios.

## Coordinación

- Separar tareas por feature o archivo para evitar conflictos.
- Puede lanzar varios implementers en paralelo cuando no compartan archivos de escritura.
- Reservar al reviewer la comprobación cruzada, no solo la ejecución de comandos.
- Integrar cambios en orden de dependencia: dominio, estado, UI, rutas y documentación.

## Cierre

Verificar los cuatro quality gates, revisar el diff completo, registrar decisiones y bugs en `progress/`. No declarar terminado un cambio que solo compile si la UX solicitada no fue comprobada.
