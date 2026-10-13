# Leonisa · Control de rollos de tela (demo)

Demo visual: los datos están quemados en `src/data.ts` y se reinician al recargar.
Referencias cargadas: **TEC 496** (ficha manuscrita) y **TEC 305** (planilla de tejeduría circular). La tercera queda pendiente.

## Local

```
npm install
npm run dev   # http://localhost:5180
```

## Servidor (Docker / Coolify)

`Dockerfile` hace el build estático y lo sirve con nginx en el puerto 80.

```
docker build -t leonisa-control-telas .
docker run -p 8080:80 leonisa-control-telas
```

En Coolify: build pack **Dockerfile**, puerto expuesto **80**.

Módulos: **Registro de rollos** · **Consulta y afinidad** (alertas + "Tomar acción") · **Seguimiento** (gráficas).
Requerimientos, transcripción de audios y supuestos: `docs/requerimientos.md`.
