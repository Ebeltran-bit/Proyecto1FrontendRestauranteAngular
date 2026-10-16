# Comanda: cliente web del restaurante

Aplicación Angular para el personal de sala: plano de mesas, pedidos por mesa, cobro con ticket,
gestión del equipo e historial con el resumen del día. Funciona en móvil, tablet y ordenador,
con modo claro y oscuro y en español o inglés (banderas en la barra superior).

Consume la API FastAPI del repositorio
[Proyecto1RestauranteAngular](https://github.com/Ebeltran-bit/Proyecto1RestauranteAngular)
(carpeta `backend/`, rama `fase3`). El registro de decisiones y cambios está en
[docs/memoria-proyecto.md](docs/memoria-proyecto.md).

## Requisitos

- Node.js 20.19 o superior (probado con Node 22) y npm.
- La API en marcha en `http://127.0.0.1:8000` (ver el README del backend).

## Puesta en marcha

```bash
npm install
npm start          # ng serve en http://localhost:4200
```

En desarrollo, las llamadas a `/api` se reenvían a `http://127.0.0.1:8000` con
`proxy.conf.json`, así que la API no necesita CORS. En producción, el servidor web que sirva la
aplicación debe reenviar `/api` a la API de la misma forma (o cambiar `API_URL` en
`src/app/core/api/api-url.ts`).

Usuarios de demostración (los crea la API al arrancar):

| Usuario   | Contraseña    | Rol      |
|-----------|---------------|----------|
| `manager` | `manager123`  | Manager  |
| `ana`     | `camarero123` | Camarero |
| `luis`    | `camarero123` | Camarero |

## Comandos

| Comando          | Qué hace                                                |
|------------------|---------------------------------------------------------|
| `npm start`      | Servidor de desarrollo con recarga automática           |
| `npm run build`  | Compila para producción en `dist/`                      |
| `npm test`       | Pruebas unitarias con Vitest                            |

## Qué puede hacer cada rol

| Función                                                         | Camarero | Manager |
|-----------------------------------------------------------------|:--------:|:-------:|
| Ver el plano de mesas (libre u ocupada, total, camarero)        | ✓        | ✓       |
| Añadir, editar (presentación, cantidad, notas) y quitar pedidos | ✓        | ✓       |
| Elegir el camarero que atiende la mesa                          | ✓        | ✓       |
| Mesa pagada: cerrar la cuenta e imprimir el ticket              | ✓        | ✓       |
| Crear y borrar usuarios (camareros y managers)                  |          | ✓       |
| Historial de cuentas y resumen del día                          |          | ✓       |

## Estructura

```
src/
  styles.scss            # tema Material 3 (claro y oscuro) y estilos comunes
  app/
    app.config.ts        # proveedores: router, HTTP con interceptor, fechas, iconos
    app.routes.ts        # rutas con carga diferida y guardas de sesión y rol
    core/
      api/               # servicios que llaman a la API (mesas, carta, usuarios, cuentas)
      auth/              # sesión, interceptor del token y guardas
      i18n/              # diccionarios es/en, servicio de idioma y pipes t, money, localDate
      theme/             # modo claro y oscuro
      ui/                # avisos y textos de error
      models/            # tipos que devuelve la API
    layout/              # barra superior, banderas, botón de tema
    shared/              # diálogo de confirmación, ticket, selector de cantidad, banderas
    features/
      login/             # inicio de sesión
      floor/             # plano de mesas (Sala)
      table-detail/      # pedidos de una mesa, diálogo de pedido y cobro
      staff/             # equipo (solo manager)
      history/           # historial y resumen del día (solo manager)
```

## Idiomas

Los textos están en `src/app/core/i18n/es.ts` y `en.ts`. El compilador obliga a que el inglés
tenga exactamente las mismas claves que el español, y una prueba lo vuelve a comprobar. El idioma
es una señal (signal): al pulsar una bandera cambian a la vez textos, precios y fechas, sin
recargar la página. La carta (nombres de mesas, productos y presentaciones) viene de la API y se
muestra tal cual.
