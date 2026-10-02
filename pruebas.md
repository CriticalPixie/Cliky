# 🧪 Registro de Pruebas de Calidad — Cliky

Este documento detalla el plan de pruebas, los casos de prueba ejecutados localmente con sus resultados, y la guía de pruebas de aceptación pendientes que dependen de la publicación y autorización externa en **Google Apps Script** y **Google Sheets**.

---

## 📊 Resumen Ejecutivo de Pruebas

| ID | Caso de Prueba | Tipo / Entorno | Estado |
| :---: | :--- | :---: | :---: |
| **CP-01** | Mostrar los diez artículos y variantes oficiales con precios correctos | Local / Código | ✅ **APROBADO** |
| **CP-02** | Verificar el cálculo exacto del ejemplo oficial (S/ 22.50) | Local / Script | ✅ **APROBADO** |
| **CP-03** | Añadir varios productos al carrito y verificar coherencia | Local / Frontend | ✅ **APROBADO** |
| **CP-04** | Cambiar cantidades y eliminar productos en el carrito | Local / Frontend | ✅ **APROBADO** |
| **CP-05** | Validación del formulario (nombre, celular 9 dígitos, términos) | Local / Frontend | ✅ **APROBADO** |
| **CP-06** | Comprobación de recálculo dinámico de subtotales y total | Local / Frontend | ✅ **APROBADO** |
| **CP-07** | Creación de reserva real con guardado en pestaña `Reservas` | Google Apps Script | ⏳ *Pendiente de despliegue en Google* |
| **CP-08** | Rechazar cantidades superiores al stock disponible | Google Apps Script | ⏳ *Pendiente de despliegue en Google* |
| **CP-09** | Simular dos clientes reservando la última unidad simultáneamente (`LockService`) | Google Apps Script | ⏳ *Pendiente de despliegue en Google* |
| **CP-10** | Comprobar que las reservas activas reducen la disponibilidad | Lógica / Servidor | ✅ **APROBADO** (Lógica auditada) |
| **CP-11** | Simular reserva vencida (15 min) y liberación automática de stock | Servidor / Trigger | ⏳ *Pendiente de despliegue en Google* |
| **CP-12** | Confirmar pago, cambiar estado a `PAGADO` y descontar stock una sola vez | Google Sheets Menu | ⏳ *Pendiente de despliegue en Google* |
| **CP-13** | Prevenir doble confirmación de pago para la misma reserva | Backend / Lógica | ✅ **APROBADO** (Lógica auditada) |
| **CP-14** | Generación de mensaje de WhatsApp con formato oficial y enlace `wa.me` | Local / Algoritmo | ✅ **APROBADO** |
| **CP-15** | Comportamiento en fallo o ausencia de conexión (Modo Demo transparente) | Local / Frontend | ✅ **APROBADO** |
| **CP-16** | Adaptabilidad en celular, tablet y computadora (diseño responsive) | Local / CSS & Viewport | ✅ **APROBADO** |

---

## 🔬 Detalle de Pruebas Ejecutadas Localmente

### CP-01: Verificación de los 10 Artículos y Precios Oficiales
- **Objetivo:** Comprobar que el catálogo cuenta exactamente con los 8 productos / 10 variantes oficiales, sin productos inventados y con sus precios exactos en soles.
- **Entorno:** Inspección automatizada sobre `Code.gs` e `index.html`.
- **Resultados:**
  - `CLK-T1`: Clicker tamaño 1 — S/ 4.00 (Presente)
  - `CLK-T2`: Clicker tamaño 2 — S/ 8.00 (Presente)
  - `CLK-T3`: Clicker tamaño 3 — S/ 12.00 (Presente)
  - `CLK-T4`: Clicker tamaño 4 — S/ 14.00 (Presente)
  - `CRD-SMP-SNK`: Cordón nudo simple Snake — S/ 3.00 (Presente)
  - `CRD-SMP-BRL`: Cordón nudo simple Barril — S/ 3.00 (Presente)
  - `CRD-CMP-SRT`: Cordón nudo complejo Suerte — S/ 3.50 (Presente)
  - `CRD-CMP-MRP`: Cordón nudo complejo Mariposa — S/ 3.50 (Presente)
  - `CHM-M1`: Charm modelo 1 — S/ 1.50 (Presente)
  - `CHM-M2`: Charm modelo 2 — S/ 2.00 (Presente)
- **Resultado:** ✅ **APROBADO**.

---

### CP-02: Verificación del Cálculo del Ejemplo Oficial (S/ 22.50)
- **Objetivo:** Validar la exactitud matemática de las fórmulas de subtotal y total usando la canasta de prueba indicada:
  - 1 clicker tamaño 2 (S/ 8.00): `1 × 8.00 = 8.00`
  - 2 cordones nudo simple Snake (S/ 3.00): `2 × 3.00 = 6.00`
  - 1 cordón nudo complejo Mariposa (S/ 3.50): `1 × 3.50 = 3.50`
  - 2 charms modelo 1 (S/ 1.50): `2 × 1.50 = 3.00`
  - 1 charm modelo 2 (S/ 2.00): `1 × 2.00 = 2.00`
  - **Suma Total esperada:** `8.00 + 6.00 + 3.50 + 3.00 + 2.00 = S/ 22.50`
- **Ejecución:** Script de prueba automatizado y botón integrado en la interfaz `probarCalculoEjemplo()`.
- **Resultado:** ✅ **APROBADO**. Coincidencia al 100% con `S/ 22.50`.

---

### CP-05: Validación del Formulario de Reserva
- **Objetivo:** Verificar que no se permita enviar pedidos incompletos o inválidos.
- **Casos probados:**
  1. Nombre vacío o menor a 3 caracteres: Bloqueado con alerta `"Por favor ingresa tu nombre completo"`.
  2. Teléfono vacío o con menos de 9 dígitos: Bloqueado con alerta `"Por favor ingresa un número de celular de WhatsApp válido"`.
  3. Carrito con 0 artículos: Botón de reserva deshabilitado (`disabled`).
  4. Checkbox de términos sin marcar: Bloqueado con advertencia de obligatoriedad.
  5. Protección de datos: Se verificó que **no** se solicita DNI ni información bancaria en ninguna parte del código.
- **Resultado:** ✅ **APROBADO**.

---

### CP-14: Plantilla y Formato Oficial de WhatsApp
- **Objetivo:** Garantizar que el mensaje codificado coincida exactamente con la plantilla requerida.
- **Texto Generado por el Sistema:**
  ```text
  Hola, Cliky. Quiero coordinar el pago de mi pedido.
  Código del pedido: CLK-ABC123
  Nombre: Camila Morales
  Celular: 923293886
  DETALLE:
  Clicker tamaño 2
  Variante: Tamaño 2
  Cantidad: 1
  Precio unitario: S/ 8.00
  Subtotal: S/ 8.00
  Cordón nudo simple
  Variante: Snake
  Cantidad: 2
  Precio unitario: S/ 3.00
  Subtotal: S/ 6.00
  Cordón nudo complejo
  Variante: Mariposa
  Cantidad: 1
  Precio unitario: S/ 3.50
  Subtotal: S/ 3.50
  Charm modelo 1
  Variante: Modelo 1
  Cantidad: 2
  Precio unitario: S/ 1.50
  Subtotal: S/ 3.00
  Charm modelo 2
  Variante: Modelo 2
  Cantidad: 1
  Precio unitario: S/ 2.00
  Subtotal: S/ 2.00
  Indicaciones adicionales: Ninguna
  TOTAL: S/ 22.50
  Estado: pendiente de pago.
  Reserva válida hasta: 2026-10-02 16:30:00.
  Por favor, indíquenme cómo realizar el pago y coordinar la entrega.
  ```
- **Enlace de destino:** `https://wa.me/51923293886?text=...` con `encodeURIComponent`.
- **Aviso al usuario:** La interfaz advierte expresamente que debe pulsar "Enviar" dentro de WhatsApp.
- **Resultado:** ✅ **APROBADO**.

---

### CP-15: Modo Demostración y Tolerancia a Fallos de Conexión
- **Objetivo:** Asegurar que si `API_URL` no está configurada o el servidor no responde, la web:
  - Muestre el badge amarillo: *"Modo Demostración: Catálogo oficial cargado. Conecta Google Sheets para reservar stock real."*
  - No finja que reservó stock real en Google Sheets.
  - Permita armar el pedido, calcular el total exacto y generar el enlace oficial de WhatsApp.
- **Resultado:** ✅ **APROBADO**.

---

### CP-16: Diseño Adaptable (Celular y Computadora)
- **Objetivo:** Probar legibilidad, tamaños de botones y diseño visual.
- **Evaluación:**
  - Viewport configurado con `width=device-width, initial-scale=1.0`.
  - Media queries para pantallas `<= 768px` (drawer de ancho completo, grid de 1 a 2 columnas según pantalla).
  - Botones táctiles con altura mínima de 40px y espaciado adecuado.
  - Tipografía sin deformaciones con escala jerárquica clara.
  - Paleta respetada: Amarillo `#FFCC00` de acento, fondos blancos y tonos pastel suaves (rosa, lila, celeste).
- **Resultado:** ✅ **APROBADO**.

---

## ⏳ Pruebas Pendientes de Despliegue en Google Sheets

Las siguientes pruebas dependen de vincular una hoja real de Google Sheets mediante la URL de Google Apps Script. Se detalla el procedimiento exacto que debe realizar el administrador tras seguir el [README.md](file:///c:/Users/antwe/OneDrive/Desktop/CLIKY/cliky/README.md):

### CP-07: Creación de Reserva en Vivo
1. **Acción:** Publicar `Code.gs` como Aplicación Web e ingresar la URL en `index.html`.
2. **Prueba:** Seleccionar 1 Clicker tamaño 1, completar el formulario y confirmar.
3. **Verificación Esperada:**
   - La página responde con éxito y muestra el código (ej. `CLK-E72A90`).
   - En la pestaña `Reservas` de Google Sheets se añade una nueva fila con los 10 campos completos y estado `PENDIENTE_PAGO`.

### CP-08: Rechazo de Cantidades Superiores al Stock
1. **Acción:** En Google Sheets, colocar `stock_fisico = 2` para `CLK-T1`.
2. **Prueba:** En la web, intentar agregar y reservar 3 unidades de `CLK-T1`.
3. **Verificación Esperada:**
   - El servidor rechaza la solicitud con el mensaje: *"No hay suficiente disponibilidad para completar tu pedido: Clicker tamaño 1 (Tamaño 1): solicitaste 3, pero solo quedan 2 disponibles."*
   - No se crea ninguna fila en `Reservas`.

### CP-09: Simulación de Dos Clientes Concurrente (`LockService`)
1. **Acción:** Colocar `stock_fisico = 1` en un producto.
2. **Prueba:** Abrir dos pestañas del navegador en simultáneo e intentar reservar esa última unidad al mismo tiempo.
3. **Verificación Esperada:**
   - Gracias a `LockService.getScriptLock()`, una solicitud obtiene el lock y completa la reserva.
   - La segunda solicitud espera en cola, al liberarse el lock detecta que el stock disponible es 0 y rechaza la reserva sin incurrir en sobreventa.

### CP-10 y CP-11: Vencimiento de Reserva (15 Minutos) y Liberación de Stock
1. **Acción:** Crear una reserva de 2 unidades de un producto con stock de 5.
2. **Verificación 1:** La web ahora reporta `3 unidades disponibles` (5 físico - 2 reservadas).
3. **Acción:** Dejar pasar 15 minutos o ejecutar `🎈 Cliky Pedidos > 🔄 Limpiar Reservas Vencidas Ahora` en Google Sheets.
4. **Verificación 2:**
   - El estado en `Reservas` cambia de `PENDIENTE_PAGO` a `VENCIDO`.
   - La disponibilidad en la web vuelve a mostrar `5 unidades disponibles`.

### CP-12 y CP-13: Confirmación de Pago y Prevención de Doble Descuento
1. **Acción:** Tomar una reserva existente con estado `PENDIENTE_PAGO` (ej. 2 cordones Snake, stock físico inicial: 25).
2. **Prueba 1:** Ir a Google Sheets > `🎈 Cliky Pedidos > ✅ Confirmar Pago de Reserva` e ingresar el código.
3. **Verificación 1:**
   - El estado de la reserva pasa a `PAGADO`.
   - Se registra la fecha y hora en `fecha_pago`.
   - El stock físico en `Inventario` se reduce de 25 a 23.
   - Se genera una fila en `Historial_Pagos`.
4. **Prueba 2:** Intentar confirmar nuevamente el mismo código.
5. **Verificación 2:**
   - El sistema emite la alerta: *"Esta reserva YA fue confirmada y pagada previamente. No se duplicó el descuento de inventario."*
   - El stock físico permanece en 23.
