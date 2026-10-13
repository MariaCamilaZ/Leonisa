# Resumen de pantallas — Leonisa · Control de rollos de tela

Demo visual. Los datos están precargados y se reinician al recargar la página.
Referencias cargadas: **Tec 496** y **Tec 305**. La tercera aparece como "pendiente".

## Elementos comunes (todas las pantallas)

- **Encabezado:** logo de Leonisa, el título "Control de calidad · Tejeduría" y el menú para cambiar entre los tres módulos.
- **Campana de alertas:** muestra cuántas alertas siguen abiertas. Al tocarla lleva a Consulta y afinidad.
- **Aviso "🚨 NUEVA ALERTA":** aparece en la esquina con sonido cuando se registra un rollo que no cumple la norma. El botón "Ver y tomar acción" lleva directo a las alertas.

## 1. Registro de rollos

Para que el operario o el supervisor registre la muestra de cada rollo.

- **Datos del rollo:** telar, rollo, turno, tejedor (responsable), referencia, fecha y tensión del plegador.
- **Muestra 1 PL:** tabla con ancho, elongación largo, elongación ancho y peso. Cada parámetro muestra el rango estándar de la referencia y, al escribir el valor medido, marca **✓ (cumple)** o **✗ (no cumple)** de inmediato.
- **Observaciones:**
  - Defectos medidos en metros, por ejemplo "3 m por aguja" o "3 m por hilo doble".
  - Una observación libre, por ejemplo "Pol 78/68/1 · PIA 40/1".
- **Estado:**
  - Si todo cumple, el rollo queda **Conforme**.
  - Si algún parámetro está fuera de norma, queda **No conforme → Alerta**. Al registrarlo se genera la alerta con el aviso y el sonido.
- **Botones "Ejemplo Tec 496" y "Ejemplo Tec 305":** llenan el formulario con datos reales de las fichas para mostrar el flujo de alerta en vivo.
- **Últimos rollos registrados:** lista con un punto verde o rojo según el resultado.

## 2. Consulta y afinidad

Para consultar una referencia, ver sus alertas y hacerles seguimiento.

- **Buscador por referencia:** se escribe el código o se elige uno de los botones (Tec 496, Tec 305).
- **Ficha técnica:** el rango estándar de cada parámetro, el último valor medido con su ✓ o ✗, y los totales de rollos medidos, no conformes y con observaciones.
- **Última afinidad:** la foto de la muestra tinturada, el resultado (Conforme o No conforme), la fecha, el telar y rollo, el color de tintura y la condición observada.
- **Alertas:**
  - **Niveles:**
    - 🟡 **Advertencia** → revisar (un parámetro fuera de norma).
    - 🔴 **Crítica** → atención inmediata (dos o más parámetros fuera).
    - 🟢 **Resuelta** → acción correctiva realizada.
  - Cada alerta muestra el telar, el rollo, el responsable, los parámetros fuera de norma frente al estándar y las observaciones del rollo.
  - El filtro deja ver solo las alertas abiertas o todas.
- **Botón "Tomar acción":** abre un formulario para hacer el seguimiento de la alerta.
  - Pide la causa encontrada, la acción correctiva, el responsable y la fecha.
  - Estado: 🔴 Pendiente / 🟡 En proceso / 🟢 Cerrada.
  - Al marcarla como Cerrada, la alerta pasa a **Resuelta**.
- **Registrar muestra de afinidad:**
  - Datos: fecha, color de tintura, telar, rollo, resultado y condición observada.
  - **Carga de imagen:** foto con la cámara del celular o un archivo, con vista previa antes de guardar.
  - Historial con miniatura de cada muestra.

## 3. Seguimiento

Para ver el comportamiento de la tela en el tiempo. Se elige la referencia arriba.

- **Indicadores:** rollos medidos, % de conformidad, alertas abiertas y última afinidad.
- **Tendencia por parámetro:** gráfica de línea de cada rollo, en la que se escoge el parámetro (ancho, elongaciones o peso).
  - La franja verde es el rango estándar.
  - Los puntos rojos son los rollos fuera de norma.
- **Conformidad por telar** y **por turno:** barras de conformes contra no conformes.
- **Estado de alertas:** gráfico circular de advertencias, críticas y resueltas.
- **Parámetros que más fallan:** cuántos rollos salieron de norma en cada parámetro.
- **Otras novedades:** total de metros por tipo de defecto y lista de los rollos con observaciones.

## Supuestos por confirmar con Leonisa

Ver `docs/requerimientos.md`. Los principales:

- Cuándo una alerta es advertencia y cuándo es crítica.
- Qué campos lleva la afinidad.
- El rango del ancho de Tec 496.
- Qué rollos de las gráficas son de ejemplo.
