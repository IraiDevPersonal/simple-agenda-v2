# Workflow multiagente

1. El leader crea un run con `pnpm harness:new "nombre"` y escribe `brief.md` y `plan.md`.
2. Divide por archivos o features: un implementer por unidad independiente.
3. Cada implementer cambia solo su zona, añade pruebas y deja notas en `changes.md`.
4. El leader integra y actualiza `changes.md`; los conflictos se resuelven preservando la arquitectura existente.
5. El reviewer verifica el diff y ejecuta validaciones funcionales, de accesibilidad y responsive.
6. Se completa `verification.md`, se ejecuta `pnpm harness:validate` y se archiva la memoria relevante en `progress/`.

Los agentes no usan credenciales ni llaman proveedores de modelos desde scripts del proyecto. La coordinación multiagente la realiza Codex. Los trabajos paralelos deben evitar escribir el mismo archivo; si no es posible, se ejecutan secuencialmente.
