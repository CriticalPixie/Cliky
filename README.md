# 🎈 CLIKY — Guía de Instalación, Configuración y Administración

Página web de pedidos para **Cliky**, diseñada especialmente para estudiantes universitarios con catálogo oficial de clickers, cordones decorativos y charms, cálculo de precios reales en soles peruanos (S/), sistema de reserva temporal de existencias (15 minutos) con **Google Sheets** como inventario central y confirmación directa mediante **WhatsApp (+51 923 293 886)**.

> **Frase de Marca:** *“Presiona. Relájate. Repite”*

---

## 📋 Índice
1. [Estructura del Proyecto](#1-estructura-del-proyecto)
2. [Catálogo Oficial y Precios Configurados](#2-catálogo-oficial-y-precios-configurados)
3. [Paso 1: Preparar la Hoja de Google Sheets](#paso-1-preparar-la-hoja-de-google-sheets)
4. [Paso 2: Crear e Implementar el Backend en Google Apps Script](#paso-2-crear-e-implementar-el-backend-en-google-apps-script)
5. [Paso 3: Configurar el Activador Periódico (Limpieza cada 5 min)](#paso-3-configurar-el-activador-periódico-limpieza-cada-5-min)
6. [Paso 4: Conectar el Frontend (`index.html`)](#paso-4-conectar-el-frontend-indexhtml)
7. [Paso 5: Publicar la Página Web Gratis con HTTPS](#paso-5-publicar-la-página-web-gratis-con-https)
8. [Paso 6: Probar desde el Celular y Computadora](#paso-6-probar-desde-el-celular-y-computadora)
9. [Flujo Operativo Diario: Gestión de Pedidos y Pagos](#flujo-operativo-diario-gestión-de-pedidos-y-pagos)
10. [Cómo Actualizar Productos, Precios, Stock e Imágenes](#cómo-actualizar-productos-precios-stock-e-imágenes)
11. [Preguntas Frecuentes y Solución de Problemas](#preguntas-frecuentes-y-solución-de-problemas)

---

## 1. Estructura del Proyecto

El proyecto está diseñado para ser completamente autónomo, ligero y sin dependencias externas:

```text
cliky/
├── index.html       # Frontend completo: Interfaz visual, catálogo, carrito, validaciones y WhatsApp (HTML+CSS+JS)
├── Code.gs          # Backend Google Apps Script: Lógica de reservas, inventario, LockService y menú administrativo
├── README.md        # Guía paso a paso en español para administradores
└── pruebas.md       # Registro técnico de pruebas ejecutadas y pruebas dependientes de despliegue
```

---

## 2. Catálogo Oficial y Precios Configurados

Todos los precios están expresados en **soles peruanos (S/)**:

| Categoría | Producto | Variante / Identificador | Precio Unitario |
| :--- | :--- | :--- | :--- |
| **A: Clickers** | Clicker tamaño 1 | Tamaño 1 | S/ 4.00 |
| **A: Clickers** | Clicker tamaño 2 | Tamaño 2 | S/ 8.00 |
| **A: Clickers** | Clicker tamaño 3 | Tamaño 3 | S/ 12.00 |
| **A: Clickers** | Clicker tamaño 4 | Tamaño 4 | S/ 14.00 |
| **B: Cordones** | Cordón nudo simple | Snake | S/ 3.00 |
| **B: Cordones** | Cordón nudo simple | Barril | S/ 3.00 |
| **B: Cordones** | Cordón nudo complejo | Suerte | S/ 3.50 |
| **B: Cordones** | Cordón nudo complejo | Mariposa | S/ 3.50 |
| **C: Charms** | Charm modelo 1 | Modelo 1 | S/ 1.50 |
| **C: Charms** | Charm modelo 2 | Modelo 2 | S/ 2.00 |

*Reglas:*
- Los charms son accesorios independientes (no van dentro de los clickers).
- “Modelo 1” y “Modelo 2” son identificadores de modelos, no colores.
- Los clientes pueden combinar cualquier cantidad de clickers, cordones y charms en el mismo pedido.

---

## Paso 1: Preparar la Hoja de Google Sheets

1. Abre tu navegador e ingresa a [Google Sheets](https://sheets.google.com).
2. Crea una nueva hoja de cálculo en blanco o abre tu hoja actual de Cliky.
3. Asigna un nombre a la hoja, por ejemplo: `Cliky - Inventario y Pedidos`.
4. El script creará automáticamente las columnas y datos oficiales por ti mediante la función de inicialización, pero si deseas conocer la estructura exacta, es la siguiente:

### Pestaña `Inventario`:
- `id_variante`: Identificador único (ej. `CLK-T1`, `CRD-SMP-SNK`, `CHM-M1`).
- `categoria`: Clickers / Cordones / Charms.
- `producto`: Nombre oficial del producto.
- `variante`: Tamaño, tipo de nudo o modelo.
- `precio`: Precio en soles (ej. `4.00`, `8.00`, `3.00`, etc.).
- `stock_fisico`: Cantidad física real disponible en taller.
- `activo`: `TRUE` o `FALSE`.
- `descripcion`: Descripción breve para la tarjeta.
- `imagen_url`: Enlace público a la fotografía (opcional; si está vacío, la web muestra una ilustración limpia vectorizada).

### Pestaña `Reservas`:
- `codigo_pedido`: Código único generado (ej. `CLK-A8F29C`).
- `fecha_creacion`: Fecha y hora de creación de la reserva.
- `fecha_vencimiento`: Fecha y hora de expiración (15 minutos posteriores).
- `nombre_cliente`: Nombre completo del universitario.
- `telefono_cliente`: Número celular de WhatsApp.
- `detalle_productos`: JSON con los artículos, variantes, cantidades y precios.
- `importe_total`: Total recalculado por el servidor en S/.
- `estado`: `PENDIENTE_PAGO`, `PAGADO`, `VENCIDO`, `CANCELADO`.
- `fecha_pago`: Fecha en que el administrador confirmó el pago.
- `observaciones`: Indicaciones especiales del cliente.

---

## Paso 2: Crear e Implementar el Backend en Google Apps Script

1. En la hoja de Google Sheets, ve al menú superior: **Extensiones > Apps Script**.
2. Se abrirá el editor de código. Borra cualquier código que aparezca por defecto en el archivo `Código.gs`.
3. Abre el archivo [`Code.gs`](file:///c:/Users/antwe/OneDrive/Desktop/CLIKY/cliky/Code.gs) de esta carpeta, copia todo su contenido y pégalo en el editor de Apps Script.
4. En la parte superior, haz clic en el ícono del **Disquete (Guardar)** o presiona `Ctrl + S`.
5. En el menú desplegable de funciones, selecciona `inicializarHojasCliky` y presiona **Ejecutar**.
   - *Google te solicitará permisos de autorización*: Haz clic en **Revisar permisos** > Selecciona tu cuenta > Haz clic en **Configuración avanzada** > Haz clic en **Ir a Cliky (no seguro)** > Presiona **Permitir**.
   - Regresa a tu hoja de cálculo: Verás que se crearon automáticamente las pestañas `Inventario`, `Reservas` e `Historial_Pagos` con todos los 10 productos y precios oficiales listos.
   - También aparecerá un nuevo menú en la barra superior llamado **🎈 Cliky Pedidos**.

### Publicar como Aplicación Web (Web App):
1. En Apps Script, haz clic en el botón azul superior **Implementar > Nueva implementación**.
2. En el ícono de engranaje (⚙️ Tipo), selecciona **Aplicación web**.
3. Configura los siguientes campos:
   - **Descripción**: `Backend Cliky v1`
   - **Ejecutar como**: `Yo (tu correo electrónico)` *(Muy importante para que tenga permiso de modificar el inventario)*
   - **Quién tiene acceso**: `Cualquier usuario` *(Cualquier usuario anónimo debe poder consultar el catálogo y solicitar reservas desde la página web)*
4. Haz clic en **Implementar**.
5. Copia la **URL de la aplicación web** generada (termina en `/exec`).  
   Ejemplo: `https://script.google.com/macros/s/AKfycbx.../exec`

---

## Paso 3: Configurar el Activador Periódico (Limpieza cada 5 min)

Para que las reservas no pagadas se liberen automáticamente cada 5 minutos incluso si nadie abre la hoja:

1. Ve a tu hoja de Google Sheets.
2. En el menú superior, haz clic en **🎈 Cliky Pedidos > ⏱️ Activar Limpiador Automático (cada 5 min)**.
3. El sistema programará el disparador automático en segundo plano.

---

## Paso 4: Conectar el Frontend (`index.html`)

Tienes dos formas sencillas de conectar la página web con el backend:

### Opción A (Recomendada directamente en el código):
1. Abre el archivo [`cliky/index.html`](file:///c:/Users/antwe/OneDrive/Desktop/CLIKY/cliky/index.html) con un editor de texto (como Bloc de notas o VS Code).
2. En la línea 565 aproximadamente, busca:
   ```javascript
   const API_URL = "PEGAR_AQUI_URL_DEL_BACKEND";
   ```
3. Reemplaza `"PEGAR_AQUI_URL_DEL_BACKEND"` por tu URL copiada en el Paso 2:
   ```javascript
   const API_URL = "https://script.google.com/macros/s/TU_ID_DE_APPS_SCRIPT/exec";
   ```
4. Guarda el archivo.

### Opción B (Desde la propia interfaz web):
1. Abre `index.html` en tu navegador.
2. En la barra superior oscura, pulsa el botón **⚙️ Configurar Backend**.
3. Pega la URL de tu Web App y haz clic en **Guardar y Conectar**. La página guardará la conexión en tu navegador y sincronizará el stock al instante.

---

## Paso 5: Publicar la Página Web Gratis con HTTPS

El archivo `index.html` está 100% autocontenido (HTML, CSS y JavaScript integrados). Puedes alojarlo gratis en cualquiera de las siguientes plataformas:

### Opción 1: GitHub Pages (Muy recomendado)
1. Crea un repositorio gratuito en [GitHub](https://github.com) llamado `cliky`.
2. Sube el archivo `index.html`.
3. Ve a **Settings > Pages > Branch**, selecciona `main` (raíz `/`) y haz clic en **Save**.
4. En 1 minuto tendrás una dirección pública con HTTPS: `https://tuusuario.github.io/cliky/`.

### Opción 2: Vercel o Netlify (Arrastrar y soltar)
1. Ingresa a [Netlify Drop](https://app.netlify.com/drop) o [Vercel](https://vercel.com).
2. Arrastra la carpeta `cliky` completa a la ventana del navegador.
3. Te entregará inmediatamente un enlace web gratuito con certificado SSL HTTPS (ej. `https://cliky-pedidos.netlify.app`).

---

## Paso 6: Probar desde el Celular y Computadora

1. Abre el enlace web en tu teléfono móvil o computadora.
2. Verifica que el indicador superior muestre:
   - **Punto verde:** `Conectado a Google Sheets: Inventario y disponibilidad en tiempo real sincronizados.`
3. Navega por las pestañas de **Clickers**, **Cordones** y **Charms**.
4. Pulsa el botón **“Cargar ejemplo S/ 22.50”** para comprobar que el cálculo matemático exacto coincide:
   - 1 clicker T2: S/ 8.00
   - 2 cordones Snake: S/ 6.00
   - 1 cordón Mariposa: S/ 3.50
   - 2 charms M1: S/ 3.00
   - 1 charm M2: S/ 2.00
   - **Total:** S/ 22.50
5. Completa el formulario de reserva con tu nombre y celular.
6. Pulsa **“Confirmar y Reservar Stock”**:
   - Se creará la reserva en la pestaña `Reservas` de Google Sheets.
   - Verás el código de pedido (ej. `CLK-B7E209`) y el contador regresivo de 15 minutos.
7. Pulsa **“Enviar pedido por WhatsApp”**:
   - Se abrirá la conversación con el número oficial **51923293886**.
   - Presiona el botón de envío dentro de WhatsApp.

---

## Flujo Operativo Diario: Gestión de Pedidos y Pagos

### 1. El cliente envía el mensaje por WhatsApp:
El cliente te enviará el mensaje estructurado con el código de pedido, lista de productos y total.

### 2. Coordinación del pago:
Le proporcionas tu número de Yape, Plin o cuenta bancaria por WhatsApp.

### 3. Confirmación del pago en Google Sheets:
Una vez que el cliente te envía la captura del pago:
1. Abre tu hoja de Google Sheets.
2. Ve al menú **🎈 Cliky Pedidos > ✅ Confirmar Pago de Reserva**.
3. Escribe o pega el código del pedido (ej. `CLK-A1B2C3`) y presiona Aceptar.
4. El sistema automáticamente:
   - Valida que la reserva exista y no haya sido pagada previamente.
   - Descuenta las unidades del **stock físico** en la pestaña `Inventario` una sola vez.
   - Cambia el estado de la reserva a `PAGADO` e ingresa la fecha y hora exacta.
   - Registra el movimiento en la pestaña `Historial_Pagos`.

### 4. Si el cliente no paga dentro de los 15 minutos:
No necesitas hacer nada: el activador automático marcará la reserva como `VENCIDO` y las existencias volverán a estar disponibles inmediatamente para otros universitarios.

---

## Cómo Actualizar Productos, Precios, Stock e Imágenes

Para modificar la tienda no necesitas tocar código; todo se gestiona desde la pestaña **`Inventario`** de Google Sheets:

- **Cambiar un precio:** Modifica el valor en la columna `precio`. En la próxima recarga de la página, los universitarios verán el nuevo precio.
- **Añadir más stock físico:** Cuando elabores nuevos clickers o cordones, aumenta el número en la columna `stock_fisico`.
- **Desactivar un producto temporalmente:** Cambia la columna `activo` a `FALSE`.
- **Agregar fotografía real:** Pega el enlace directo de la imagen en la columna `imagen_url`. Si dejas la celda vacía, la página mostrará automáticamente la ilustración estilizada de Cliky.

---

## Preguntas Frecuentes y Solución de Problemas

### 1. ¿Por qué al abrir la página web dice "Modo Demostración"?
Ocurre porque aún no has pegado la URL de tu aplicación web de Google Apps Script en `index.html` o no has guardado la URL desde el botón superior de configuración. En este modo el catálogo funciona con los precios oficiales, pero no reserva stock en Google Sheets.

### 2. Al publicar en Apps Script, ¿qué permisos debo elegir?
Debes elegir siempre:
- **Ejecutar como:** `Yo`
- **Quién tiene acceso:** `Cualquier usuario` (Anyone)  
Si seleccionas "Solo yo", los clientes recibirán un error de permisos al intentar cargar el inventario.

### 3. ¿El mensaje de WhatsApp se envía solo?
No. Por políticas de seguridad de WhatsApp, el enlace abre la conversación con el mensaje ya redactado y con todos los productos desglosados, pero el cliente debe pulsar el botón **Enviar (flecha)** dentro de WhatsApp. La página web informa esto claramente al universitario.

### 4. ¿Qué pasa si dos clientes intentan reservar la última unidad a la vez?
El backend utiliza `LockService` de Google Apps Script. Las solicitudes se forman en una cola atómica: la primera reserva toma la unidad y a la segunda se le informa inmediatamente que el producto se acaba de agotar, evitando sobreventas.
