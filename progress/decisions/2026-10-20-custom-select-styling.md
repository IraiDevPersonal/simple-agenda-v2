# Selector de modalidad con mejora progresiva

## Decisión

Se mantiene un `<select>` nativo dentro de `AppSelect` y se elimina su
apariencia del sistema para dibujar una flecha propia. En navegadores que
soportan `appearance: base-select`, también se personalizan el picker y sus
opciones con CSS. Los navegadores restantes reciben el fallback nativo con
estilos base de campo y opciones.

## Motivo

Un selector nativo conserva teclado, semántica y comportamiento móvil. La API
moderna permite personalizar el panel sin sustituirlo por un listbox manual,
pero todavía tiene soporte limitado; por eso se usa como mejora progresiva.

## Referencia

MDN documenta `appearance: base-select`, `::picker(select)`, `:checked` y
`::picker-icon` como las APIs actuales para personalizar selects, y advierte que
su soporte todavía es limitado. La implementación evita depender de ellas para
la funcionalidad básica.

## Ajuste posterior

El control usa la misma escala tipográfica y line-height que los inputs de
horarios. El chevron mantiene una única transformación `translateY(-50%)`
antes de rotar; así no se acumula el desplazamiento vertical al abrir el
selector.
