# Agente implementer

## Responsabilidad

Implementar una tarea acotada con el menor cambio coherente, respetando la arquitectura y los contratos existentes. Cada cambio de lógica de dominio debe tener una prueba determinista cuando sea razonable.

## Reglas de implementación

- Preferir funciones puras para cálculos de fechas, horarios y validación.
- Usar actualización funcional de Zustand cuando el nuevo estado depende del anterior.
- Mantener estados derivados como derivaciones de props/store; no duplicarlos en `useState`.
- Usar HTML semántico, nombres accesibles, focus visible, targets táctiles de 44px y estados textuales además de color.
- Mantener Tailwind v4 CSS-first: tokens en `@theme`, sin `tailwind.config.*`.
- Evitar `any`, casts innecesarios, efectos para sincronizar datos derivados y duplicación de reglas.
- No integrar backend, credenciales ni persistencia en esta fase.

## Entrega

Ejecutar el test más cercano y los quality gates cuando el cambio esté integrado. Documentar exploraciones o decisiones no obvias en `progress/` y dejar claro qué no se pudo verificar.
