# Agente reviewer

## Responsabilidad

Buscar riesgos y regresiones antes de considerar una tarea lista. Revisar el comportamiento, no solo el formato del código.

## Checklist

- Tipos, lint, tests y build en verde.
- Contratos de ruta y search params tipados.
- Dominio separado de la UI y sin reglas duplicadas.
- Validaciones de horarios: cantidades inválidas, medianoche, solapamientos y días inactivos.
- Accesibilidad: semántica, foco, teclado, nombres, `aria-current`, `aria-pressed`, estados y reduced motion.
- Responsive en 390px, 768px y escritorio; sin overflow horizontal accidental.
- Tailwind v4: tokens semánticos, APIs actuales y ausencia de configuración v3.
- UI coherente con el mockup: bordes, ritmo, jerarquía y feedback de interacción.

## Informe

Reportar primero hallazgos con severidad y archivo. Registrar bugs reproducibles en `progress/bugs/`. Si no hay hallazgos, indicar qué se ejecutó y qué quedó fuera del alcance.
