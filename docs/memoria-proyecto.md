# Memoria del proyecto: cliente web Angular

Registro de las decisiones y los cambios del frontend. La memoria del backend está en
`docs/memoria-proyecto.md` del repositorio Proyecto1RestauranteAngular.

## Fase 3: Frontend Angular

### Punto de partida (2026-10-16)

El repositorio tenía un único commit con dos carpetas, `FrontendProyectoRestauranteAngular` y
`BackendProyectoRestauranteAngular`, subidas como punteros a otros repositorios porque cada una
tenía su propio `.git` dentro. En GitHub no había código Angular. También había un ejercicio
`Python/proyecto1/HolaMundo.py` que no tiene que ver con la aplicación.

### Requisitos (2026-10-16)

David pide una interfaz Angular con estética profesional, lista para enseñar a un negocio y
usarse directamente:

- Panel de usuarios con roles manager y camarero.
- "Mesa pagada": borra la cuenta de la mesa y permite añadir una nueva directamente.
- Elegir el camarero que ha servido la mesa; crear y borrar camareros.
- Modo claro y oscuro.
- Banderas de UK y España arriba que cambian el idioma de la aplicación al instante.

Extras propuestos por Claude y aprobados por David: plano de mesas con colores por estado,
precios con total y ticket imprimible, borrar líneas de pedido, historial de mesas cobradas y
resumen del día para el manager, diseño para tablet y móvil, y notas en cada pedido.

### Decisiones (2026-10-16)

| # | Decisión | Motivo |
|---|----------|--------|
| 1 | Proyecto Angular 21 nuevo en la raíz del repositorio; se quitan las dos carpetas-puntero y `HolaMundo.py` | Opción A elegida por David; la misma versión de Angular que el esqueleto del otro repositorio |
| 2 | Rama `fase3` creada desde `main` | Aprobado por David |
| 3 | Angular Material (y su CDK) como librería de componentes, con tema Material 3 | Aprobado por David: componentes accesibles y tema claro/oscuro incluidos |
| 4 | Traducción propia con signals en vez del i18n oficial de Angular o ngx-translate | Elegida por David. El i18n oficial genera una versión por idioma y no cambia sin recargar; la propia no instala nada |
| 5 | Diccionarios en TypeScript (`es.ts`, `en.ts`), con el tipo del español obligatorio para el inglés | El compilador avisa si falta un texto en algún idioma |
| 6 | Banderas dibujadas en SVG dentro de un componente | Sin imágenes ni paquetes extra |
| 7 | Tipografía Inter e iconos Material Symbols desde Google Fonts (enlace en `index.html`) | Fuentes, no paquetes npm; es la forma estándar de cargar los iconos de Material |
| 8 | Componentes standalone, signals, control de flujo `@if`/`@for` y aplicación sin zone.js | Lo que recomienda Angular 21; menos código y mejor rendimiento |
| 9 | Carga diferida de cada pantalla y guardas por sesión y rol | La pantalla de login carga rápido y un camarero no puede abrir las de manager |
| 10 | Sesión guardada en `localStorage` y validada con `/auth/me` al arrancar | Recargar la página no cierra la sesión; un token caducado lleva al login |
| 11 | Interceptor que añade el token solo a las llamadas a la API y cierra la sesión ante un 401 | El token no sale hacia otros servidores |
| 12 | Proxy de desarrollo (`proxy.conf.json`): `/api` va a `http://127.0.0.1:8000` | El navegador ve un solo origen; no hace falta CORS en la API |
| 13 | Tema por clase en `<html>` (`light-theme`/`dark-theme`) y colores tomados de variables `--mat-sys-*` | Un solo cambio de clase repinta toda la app; la primera vez sigue la preferencia del sistema |
| 14 | Los errores de la API se muestran tal cual en español; en inglés se traduce un texto según el código | La API redacta sus mensajes en español |
| 15 | La sala se refresca sola cada 20 s mientras la pestaña está visible | Otros camareros cambian las mesas desde sus dispositivos |
| 16 | "Mesa pagada" pide confirmación con el total, exige camarero asignado y muestra el ticket listo para imprimir en 80 mm | Lo que pidió David, evitando cobros por error |
| 17 | Al bajar la cantidad por debajo de 1 se ofrece quitar la línea | Gesto natural en la lista; siempre con confirmación |
| 18 | Los totales se calculan en céntimos | Evita errores de redondeo con decimales |
| 19 | La identidad visual se llama "Comanda", en tono naranja tostado | Nombre y color neutros para presentar a cualquier restaurante; fácil de cambiar en `es.ts`, `en.ts` y `styles.scss` |

### Cambios (2026-10-16)

- Proyecto generado con Angular CLI 21.2 (SCSS, sin SSR, sin zone.js) y `@angular/material` 21.2.
- `core/`: servicios de API, sesión, interceptor, guardas, idiomas, tema y avisos.
- `layout/`: barra superior con navegación, banderas, tema y menú de usuario; barra inferior en
  móvil para los managers.
- Pantallas: login, Sala (plano con estadísticas), Mesa (pedidos, camarero, total y cobro),
  diálogo de pedido (buscador sin acentos, categorías, presentación con precio, cantidad y
  notas), ticket imprimible, Equipo e Historial (fecha, facturación, cuentas, ticket medio, ventas
  por camarero, lo más vendido y cuentas del día).
- Pruebas unitarias: idiomas (mismas claves, cambio en caliente, formato de moneda), tema,
  interceptor del token, banderas y fecha local.
- README con la puesta en marcha, usuarios de demostración, permisos por rol y estructura.

### Verificación (2026-10-16)

- `npm test`: 11 de 11 pruebas pasan.
- `npm run build`: compila sin avisos (115 kB comprimidos de carga inicial).
- Recorrido completo en Chromium contra la API real (rama `fase3`): contraseña incorrecta, login
  de manager, añadir croquetas con notas, subir cantidad, editar notas, quitar una línea, cobrar
  con ticket (total 30,40 € correcto), añadir un pedido nuevo a la mesa recién cobrada, bloqueo
  del cobro sin camarero, asignar camarero, cambio a inglés y modo oscuro, historial con el
  resumen, crear un usuario (con aviso de nombre repetido), borrarlo, y aviso al borrar a un
  camarero con mesas abiertas. Al recargar se mantienen sesión, idioma y tema.
- Móvil (390 px) con un camarero: no ve Historial ni Equipo y la ruta `/historial` le devuelve
  a la Sala.
