# Ahí Viene · Dual UI v4 Secciones

Versión basada en la v4 real, con dos interfaces en el mismo proyecto.

## Cambios principales

- Vista PC con paneles laterales.
- Vista celular con secciones inferiores: Mapa, Rutas, Compartir, Reportar y Comunidad.
- En celular, el mapa queda limpio cuando estás en la sección Mapa.
- Compartir GPS real cada 2 segundos.
- Los reportes usan tu ubicación GPS exacta.
- Ver ruta abre RutaDirecta.
- Sin usuarios falsos, sin camiones falsos y sin trazos inventados.

## Ejecutar

```bat
cd C:\Users\ariel\Downloads\ahi-viene-dual-ui-v4-secciones\ahi-viene-dual-ui-v4-secciones
npm install
npm start
```

Abrir:

```txt
http://localhost:3021
```

Vistas directas:

```txt
http://localhost:3021/?view=mobile
http://localhost:3021/?view=desktop
http://localhost:3021/?view=mobile&section=rutas
```
