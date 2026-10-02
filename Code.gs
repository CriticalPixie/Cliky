/**
 * ============================================================================
 * CLIKY - BACKEND GOOGLE APPS SCRIPT (Code.gs)
 * Sistema de Catálogo, Precios Reales y Reserva Temporal de Stock para Cliky
 * WhatsApp de Pedidos: +51 923 293 886
 * Frase de Marca: "Presiona. Relájate. Repite"
 * ============================================================================
 */

// ==========================================
// CONFIGURACIÓN PRINCIPAL
// ==========================================
var CONFIG = {
  // Duración de la reserva temporal en minutos (configurable)
  DURACION_RESERVA_MINUTOS: 15,

  // Nombres de las pestañas en Google Sheets
  HOJA_INVENTARIO: 'Inventario',
  HOJA_RESERVAS: 'Reservas',
  HOJA_HISTORIAL: 'Historial_Pagos',

  // Número oficial de WhatsApp para pedidos
  WHATSAPP_NUMERO: '51923293886',

  // Zona horaria para registro de fechas (Perú: America/Lima)
  ZONA_HORARIA: 'America/Lima',
  FORMATO_FECHA: 'yyyy-MM-dd HH:mm:ss',

  // Token secreto para operaciones administrativas vía API (opcional)
  // Nota: Las operaciones administrativas también pueden ejecutarse directamente
  // desde el menú superior de Google Sheets sin exponer ningún token.
  TOKEN_ADMIN_API: 'CLIKY_ADMIN_SECURE_KEY_2026'
};

// ==========================================
// CATÁLOGO OFICIAL INICIAL DE CLIKY
// ==========================================
var CATALOGO_OFICIAL_INICIAL = [
  // Categoría A: Clickers
  {
    id_variante: 'CLK-T1',
    categoria: 'Clickers',
    producto: 'Clicker tamaño 1',
    variante: 'Tamaño 1',
    precio: 4.00,
    stock_fisico: 20,
    activo: true,
    descripcion: 'Clicker compacto de pulsación ergonómica y sonido satisfactorio.',
    imagen_url: ''
  },
  {
    id_variante: 'CLK-T2',
    categoria: 'Clickers',
    producto: 'Clicker tamaño 2',
    variante: 'Tamaño 2',
    precio: 8.00,
    stock_fisico: 20,
    activo: true,
    descripcion: 'Clicker tamaño mediano con excelente respuesta táctil.',
    imagen_url: ''
  },
  {
    id_variante: 'CLK-T3',
    categoria: 'Clickers',
    producto: 'Clicker tamaño 3',
    variante: 'Tamaño 3',
    precio: 12.00,
    stock_fisico: 15,
    activo: true,
    descripcion: 'Clicker tamaño grande con pulsación firme y alivio de estrés.',
    imagen_url: ''
  },
  {
    id_variante: 'CLK-T4',
    categoria: 'Clickers',
    producto: 'Clicker tamaño 4',
    variante: 'Tamaño 4',
    precio: 14.00,
    stock_fisico: 15,
    activo: true,
    descripcion: 'Clicker de máxima dimensión, agarre cómodo y máxima durabilidad.',
    imagen_url: ''
  },
  // Categoría B: Cordones
  {
    id_variante: 'CRD-SMP-SNK',
    categoria: 'Cordones',
    producto: 'Cordón nudo simple Snake',
    variante: 'Snake',
    precio: 3.00,
    stock_fisico: 25,
    activo: true,
    descripcion: 'Cordón decorativo artesanal con tejido en nudo simple tipo Snake.',
    imagen_url: ''
  },
  {
    id_variante: 'CRD-SMP-BRL',
    categoria: 'Cordones',
    producto: 'Cordón nudo simple Barril',
    variante: 'Barril',
    precio: 3.00,
    stock_fisico: 25,
    activo: true,
    descripcion: 'Cordón decorativo artesanal con tejido en nudo simple tipo Barril.',
    imagen_url: ''
  },
  {
    id_variante: 'CRD-CMP-SRT',
    categoria: 'Cordones',
    producto: 'Cordón nudo complejo Suerte',
    variante: 'Suerte',
    precio: 3.50,
    stock_fisico: 20,
    activo: true,
    descripcion: 'Cordón decorativo con tramado elaborado en nudo complejo de la Suerte.',
    imagen_url: ''
  },
  {
    id_variante: 'CRD-CMP-MRP',
    categoria: 'Cordones',
    producto: 'Cordón nudo complejo Mariposa',
    variante: 'Mariposa',
    precio: 3.50,
    stock_fisico: 20,
    activo: true,
    descripcion: 'Cordón decorativo con diseño intrincado en nudo complejo Mariposa.',
    imagen_url: ''
  },
  // Categoría C: Charms
  {
    id_variante: 'CHM-M1',
    categoria: 'Charms',
    producto: 'Charm modelo 1',
    variante: 'Modelo 1',
    precio: 1.50,
    stock_fisico: 30,
    activo: true,
    descripcion: 'Accesorio charm independiente modelo 1 para personalizar tu combinación.',
    imagen_url: ''
  },
  {
    id_variante: 'CHM-M2',
    categoria: 'Charms',
    producto: 'Charm modelo 2',
    variante: 'Modelo 2',
    precio: 2.00,
    stock_fisico: 30,
    activo: true,
    descripcion: 'Accesorio charm independiente modelo 2 con diseño exclusivo.',
    imagen_url: ''
  }
];

// ==========================================
// MENÚ SUPERIOR EN GOOGLE SHEETS
// ==========================================
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🎈 Cliky Pedidos')
    .addItem('✅ Confirmar Pago de Reserva', 'menuConfirmarPago')
    .addItem('❌ Cancelar Reserva', 'menuCancelarReserva')
    .addSeparator()
    .addItem('🔄 Limpiar Reservas Vencidas Ahora', 'menuLimpiarVencidas')
    .addItem('⏱️ Activar Limpiador Automático (cada 5 min)', 'configurarActivadorPeriodico')
    .addSeparator()
    .addItem('📦 Inicializar / Restaurar Estructura Cliky', 'inicializarHojasCliky')
    .addToUi();
}

// ==========================================
// INICIALIZACIÓN DE HOJAS Y ESTRUCTURA
// ==========================================
/**
 * Crea o verifica las pestañas Inventario y Reservas con las columnas oficiales.
 * Si no existen productos, inserta los 8 productos y variantes oficiales.
 */
function inicializarHojasCliky() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Pestaña de Inventario
  var hojaInv = ss.getSheetByName(CONFIG.HOJA_INVENTARIO);
  if (!hojaInv) {
    hojaInv = ss.insertSheet(CONFIG.HOJA_INVENTARIO);
  }

  // Encabezados obligatorios de Inventario
  var cabecerasInv = [
    'id_variante',
    'categoria',
    'producto',
    'variante',
    'precio',
    'stock_fisico',
    'activo',
    'descripcion',
    'imagen_url'
  ];

  if (hojaInv.getLastRow() === 0) {
    hojaInv.appendRow(cabecerasInv);
    hojaInv.getRange(1, 1, 1, cabecerasInv.length)
      .setBackground('#FFCC00')
      .setFontWeight('bold')
      .setFontColor('#000000');

    // Cargar catálogo oficial inicial
    CATALOGO_OFICIAL_INICIAL.forEach(function (item) {
      hojaInv.appendRow([
        item.id_variante,
        item.categoria,
        item.producto,
        item.variante,
        item.precio,
        item.stock_fisico,
        item.activo,
        item.descripcion,
        item.imagen_url
      ]);
    });
    hojaInv.setFrozenRows(1);
    hojaInv.autoResizeColumns(1, cabecerasInv.length);
  }

  // 2. Pestaña de Reservas (campos obligatorios del requerimiento)
  var hojaRes = ss.getSheetByName(CONFIG.HOJA_RESERVAS);
  if (!hojaRes) {
    hojaRes = ss.insertSheet(CONFIG.HOJA_RESERVAS);
  }

  var cabecerasRes = [
    'codigo_pedido',
    'fecha_creacion',
    'fecha_vencimiento',
    'nombre_cliente',
    'telefono_cliente',
    'detalle_productos',
    'importe_total',
    'estado',
    'fecha_pago',
    'observaciones'
  ];

  if (hojaRes.getLastRow() === 0) {
    hojaRes.appendRow(cabecerasRes);
    hojaRes.getRange(1, 1, 1, cabecerasRes.length)
      .setBackground('#E0F2FE')
      .setFontWeight('bold')
      .setFontColor('#0F172A');
    hojaRes.setFrozenRows(1);
    hojaRes.autoResizeColumns(1, cabecerasRes.length);
  }

  // 3. Pestaña de Historial de Pagos
  var hojaHist = ss.getSheetByName(CONFIG.HOJA_HISTORIAL);
  if (!hojaHist) {
    hojaHist = ss.insertSheet(CONFIG.HOJA_HISTORIAL);
    var cabecerasHist = [
      'id_registro',
      'codigo_pedido',
      'fecha_pago',
      'nombre_cliente',
      'telefono_cliente',
      'importe_total',
      'detalle_descontado'
    ];
    hojaHist.appendRow(cabecerasHist);
    hojaHist.getRange(1, 1, 1, cabecerasHist.length)
      .setBackground('#DCFCE7')
      .setFontWeight('bold')
      .setFontColor('#14532D');
    hojaHist.setFrozenRows(1);
    hojaHist.autoResizeColumns(1, cabecerasHist.length);
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(
    'Estructura de Cliky inicializada correctamente con catálogo oficial.',
    'Cliky Listo',
    5
  );
}

// ==========================================
// ACTIVADOR PERIÓDICO (CADA 5 MINUTOS)
// ==========================================
/**
 * Configura un trigger por tiempo para limpiar automáticamente reservas vencidas cada 5 min.
 */
function configurarActivadorPeriodico() {
  // Borrar triggers previos de la misma función para evitar duplicados
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'revisarReservasVencidasTrigger') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('revisarReservasVencidasTrigger')
    .timeBased()
    .everyMinutes(5)
    .create();

  SpreadsheetApp.getActiveSpreadsheet().toast(
    'Activador automático configurado cada 5 minutos para liberar stock de reservas vencidas.',
    'Activador Cliky',
    6
  );
}

function revisarReservasVencidasTrigger() {
  limpiarReservasVencidas();
}

// ==========================================
// GESTIÓN Y LIMPIEZA DE RESERVAS VENCIDAS
// ==========================================
/**
 * Revisa la hoja Reservas y marca como 'VENCIDO' aquellas con estado 'PENDIENTE_PAGO'
 * cuya fecha_vencimiento haya expirado.
 */
function limpiarReservasVencidas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaRes = ss.getSheetByName(CONFIG.HOJA_RESERVAS);
  if (!hojaRes || hojaRes.getLastRow() <= 1) return 0;

  var lock = LockService.getScriptLock();
  try {
    // Esperar hasta 10 segundos para adquirir el lock
    lock.waitLock(10000);
  } catch (e) {
    Logger.log('Lock no disponible al limpiar vencidas: ' + e);
    return 0;
  }

  var countVencidas = 0;
  try {
    var data = hojaRes.getDataRange().getValues();
    var headers = data[0];

    var idxEstado = headers.indexOf('estado');
    var idxVencimiento = headers.indexOf('fecha_vencimiento');

    if (idxEstado === -1 || idxVencimiento === -1) {
      lock.releaseLock();
      return 0;
    }

    var ahora = new Date().getTime();

    for (var i = 1; i < data.length; i++) {
      var estado = String(data[i][idxEstado]).trim().toUpperCase();
      if (estado === 'PENDIENTE_PAGO') {
        var fechaVenc = new Date(data[i][idxVencimiento]).getTime();
        if (fechaVenc && fechaVenc <= ahora) {
          hojaRes.getRange(i + 1, idxEstado + 1).setValue('VENCIDO');
          countVencidas++;
        }
      }
    }
  } finally {
    lock.releaseLock();
  }

  return countVencidas;
}

function menuLimpiarVencidas() {
  var total = limpiarReservasVencidas();
  var ui = SpreadsheetApp.getUi();
  ui.alert(
    'Limpieza Completada',
    'Se actualizaron ' + total + ' reserva(s) vencida(s). El stock quedó liberado automáticamente.',
    ui.ButtonSet.OK
  );
}

// ==========================================
// CÁLCULO DE STOCK DISPONIBLE
// ==========================================
/**
 * Stock disponible = stock físico - unidades de reservas pendientes y no vencidas.
 * Devuelve un mapa indexado por id_variante.
 */
function calcularStockDisponibleMap() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaInv = ss.getSheetByName(CONFIG.HOJA_INVENTARIO);
  var hojaRes = ss.getSheetByName(CONFIG.HOJA_RESERVAS);

  if (!hojaInv) {
    throw new Error('No se encontró la pestaña ' + CONFIG.HOJA_INVENTARIO);
  }

  // 1. Limpiar vencidas previamente
  limpiarReservasVencidas();

  // 2. Mapear stock físico
  var dataInv = hojaInv.getDataRange().getValues();
  var headersInv = dataInv[0];

  var idxId = headersInv.indexOf('id_variante');
  var idxStock = headersInv.indexOf('stock_fisico');
  var idxPrecio = headersInv.indexOf('precio');
  var idxActivo = headersInv.indexOf('activo');
  var idxProducto = headersInv.indexOf('producto');
  var idxVariante = headersInv.indexOf('variante');
  var idxCategoria = headersInv.indexOf('categoria');
  var idxDesc = headersInv.indexOf('descripcion');
  var idxImg = headersInv.indexOf('imagen_url');

  var catalogoMap = {};

  for (var i = 1; i < dataInv.length; i++) {
    var id = String(dataInv[i][idxId]).trim();
    if (!id) continue;

    var stockFisico = Number(dataInv[i][idxStock]) || 0;
    var precio = Number(dataInv[i][idxPrecio]) || 0;
    var activo = dataInv[i][idxActivo] === true || String(dataInv[i][idxActivo]).toLowerCase() === 'true';

    catalogoMap[id] = {
      rowIndex: i + 1,
      id_variante: id,
      categoria: dataInv[i][idxCategoria] || '',
      producto: dataInv[i][idxProducto] || '',
      variante: dataInv[i][idxVariante] || '',
      precio: precio,
      stock_fisico: stockFisico,
      stock_reservado: 0,
      stock_disponible: stockFisico,
      activo: activo,
      descripcion: dataInv[i][idxDesc] || '',
      imagen_url: dataInv[i][idxImg] || ''
    };
  }

  // 3. Contar reservas activas (PENDIENTE_PAGO y no vencidas)
  if (hojaRes && hojaRes.getLastRow() > 1) {
    var dataRes = hojaRes.getDataRange().getValues();
    var headersRes = dataRes[0];
    var idxResEstado = headersRes.indexOf('estado');
    var idxResVenc = headersRes.indexOf('fecha_vencimiento');
    var idxResDetalle = headersRes.indexOf('detalle_productos');

    var ahora = new Date().getTime();

    for (var r = 1; r < dataRes.length; r++) {
      var est = String(dataRes[r][idxResEstado]).trim().toUpperCase();
      var venc = new Date(dataRes[r][idxResVenc]).getTime();

      if (est === 'PENDIENTE_PAGO' && venc > ahora) {
        var detalleRaw = dataRes[r][idxResDetalle];
        var items = [];
        try {
          items = JSON.parse(detalleRaw);
        } catch (e) {
          // Si no es JSON puro, saltar o ignorar
        }

        if (Array.isArray(items)) {
          items.forEach(function (it) {
            var sId = String(it.id_variante || it.sku).trim();
            var cQty = Number(it.cantidad || it.qty) || 0;
            if (catalogoMap[sId]) {
              catalogoMap[sId].stock_reservado += cQty;
            }
          });
        }
      }
    }
  }

  // 4. Calcular stock disponible final = stock_fisico - stock_reservado
  for (var k in catalogoMap) {
    catalogoMap[k].stock_disponible = Math.max(
      0,
      catalogoMap[k].stock_fisico - catalogoMap[k].stock_reservado
    );
  }

  return catalogoMap;
}

// ==========================================
// CONSULTA DE CATÁLOGO (API PÚBLICA)
// ==========================================
function obtenerCatalogoParaFrontend() {
  var catalogoMap = calcularStockDisponibleMap();
  var lista = [];

  for (var k in catalogoMap) {
    var item = catalogoMap[k];
    if (item.activo) {
      lista.push({
        id_variante: item.id_variante,
        categoria: item.categoria,
        producto: item.producto,
        variante: item.variante,
        precio: item.precio,
        stock_fisico: item.stock_fisico,
        stock_reservado: item.stock_reservado,
        stock_disponible: item.stock_disponible,
        descripcion: item.descripcion,
        imagen_url: item.imagen_url
      });
    }
  }

  return {
    success: true,
    empresa: 'Cliky',
    frase: 'Presiona. Relájate. Repite',
    whatsapp: CONFIG.WHATSAPP_NUMERO,
    duracion_reserva_minutos: CONFIG.DURACION_RESERVA_MINUTOS,
    catalogo: lista
  };
}

// ==========================================
// CREACIÓN DE RESERVA TEMPORAL (LOCKSERVICE)
// ==========================================
/**
 * Crea una reserva de stock temporal garantizando atomicidad y verificación estricta.
 * Si falta stock de un solo artículo, rechaza el pedido completo.
 *
 * @param {Object} datosPedido { nombre_cliente, telefono_cliente, observaciones, items: [{ id_variante, cantidad }] }
 */
function crearReservaStock(datosPedido) {
  var lock = LockService.getScriptLock();
  var lockAdquirido = false;

  try {
    // Esperar hasta 20 segundos para asegurar que operaciones concurrentes no se pisen
    lockAdquirido = lock.tryLock(20000);
    if (!lockAdquirido) {
      return {
        success: false,
        error: 'SISTEMA_OCUPADO',
        message: 'El sistema de reservas está procesando otro pedido en este instante. Por favor, intenta de nuevo en unos segundos.'
      };
    }

    // 1. Validaciones básicas de cliente
    if (!datosPedido.nombre_cliente || String(datosPedido.nombre_cliente).trim().length < 3) {
      return { success: false, error: 'NOMBRE_INVALIDO', message: 'Por favor ingresa tu nombre completo.' };
    }

    var telefonoLimpio = String(datosPedido.telefono_cliente || '').replace(/\D/g, '');
    if (telefonoLimpio.length < 8) {
      return { success: false, error: 'TELEFONO_INVALIDO', message: 'Por favor ingresa un número de celular válido para coordinar por WhatsApp.' };
    }

    if (!Array.isArray(datosPedido.items) || datosPedido.items.length === 0) {
      return { success: false, error: 'CARRITO_VACIO', message: 'Tu carrito de compras está vacío.' };
    }

    // 2. Limpieza de vencidas y obtención de disponibilidad fresca bajo Lock
    var catalogoMap = calcularStockDisponibleMap();

    // 3. Validación y verificación estricta de stock y precios de cada producto
    var detalleParaGuardar = [];
    var erroresStock = [];
    var totalCalculadoServidor = 0;

    for (var i = 0; i < datosPedido.items.length; i++) {
      var itemPedido = datosPedido.items[i];
      var idVar = String(itemPedido.id_variante || itemPedido.sku).trim();
      var cant = parseInt(itemPedido.cantidad || itemPedido.qty, 10);

      if (isNaN(cant) || cant <= 0) {
        return {
          success: false,
          error: 'CANTIDAD_INVALIDA',
          message: 'La cantidad seleccionada para el producto ' + idVar + ' debe ser mayor a cero.'
        };
      }

      var prodReal = catalogoMap[idVar];
      if (!prodReal) {
        return {
          success: false,
          error: 'PRODUCTO_NO_EXISTE',
          message: 'El producto con ID ' + idVar + ' no se encuentra en el catálogo oficial de Cliky.'
        };
      }

      if (!prodReal.activo) {
        return {
          success: false,
          error: 'PRODUCTO_INACTIVO',
          message: 'El producto ' + prodReal.producto + ' (' + prodReal.variante + ') está deshabilitado temporalmente.'
        };
      }

      // Comprobar disponibilidad real
      if (cant > prodReal.stock_disponible) {
        erroresStock.push({
          id_variante: idVar,
          producto: prodReal.producto,
          variante: prodReal.variante,
          solicitado: cant,
          disponible: prodReal.stock_disponible
        });
      }

      var subtotalItem = Math.round(prodReal.precio * cant * 100) / 100;
      totalCalculadoServidor += subtotalItem;

      detalleParaGuardar.push({
        id_variante: prodReal.id_variante,
        categoria: prodReal.categoria,
        producto: prodReal.producto,
        variante: prodReal.variante,
        cantidad: cant,
        precio_unitario: prodReal.precio,
        subtotal: subtotalItem
      });
    }

    // Si falta stock de un solo artículo, rechazar la reserva completa
    if (erroresStock.length > 0) {
      var descErrores = erroresStock.map(function (e) {
        return e.producto + ' (' + e.variante + '): solicitaste ' + e.solicitado + ', pero solo quedan ' + e.disponible + ' disponibles.';
      }).join('\n');

      return {
        success: false,
        error: 'STOCK_INSUFICIENTE',
        message: 'No hay suficiente disponibilidad para completar tu pedido:\n' + descErrores,
        detalles_errores: erroresStock
      };
    }

    totalCalculadoServidor = Math.round(totalCalculadoServidor * 100) / 100;

    // 4. Generar código de pedido único para Cliky
    var codigoPedido = 'CLK-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // 5. Fechas de creación y vencimiento
    var ahoraDate = new Date();
    var vencimientoDate = new Date(ahoraDate.getTime() + CONFIG.DURACION_RESERVA_MINUTOS * 60 * 1000);

    var fechaCreacionStr = Utilities.formatDate(ahoraDate, CONFIG.ZONA_HORARIA, CONFIG.FORMATO_FECHA);
    var fechaVencimientoStr = Utilities.formatDate(vencimientoDate, CONFIG.ZONA_HORARIA, CONFIG.FORMATO_FECHA);

    // 6. Guardar en la hoja Reservas
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var hojaRes = ss.getSheetByName(CONFIG.HOJA_RESERVAS);
    if (!hojaRes) {
      throw new Error('Pestaña Reservas no configurada.');
    }

    var observaciones = datosPedido.observaciones ? String(datosPedido.observaciones).trim() : 'Ninguna';

    var filaNueva = [
      codigoPedido,
      fechaCreacionStr,
      fechaVencimientoStr,
      String(datosPedido.nombre_cliente).trim(),
      telefonoLimpio,
      JSON.stringify(detalleParaGuardar),
      totalCalculadoServidor,
      'PENDIENTE_PAGO',
      '', // fecha_pago vacía al inicio
      observaciones
    ];

    hojaRes.appendRow(filaNueva);

    // 7. Generar texto oficial para WhatsApp
    var textoWhatsApp = construirMensajeWhatsApp({
      codigo_pedido: codigoPedido,
      nombre_cliente: datosPedido.nombre_cliente,
      telefono_cliente: telefonoLimpio,
      detalle: detalleParaGuardar,
      observaciones: observaciones,
      total: totalCalculadoServidor,
      fecha_vencimiento_str: fechaVencimientoStr
    });

    var enlaceWhatsApp = 'https://wa.me/' + CONFIG.WHATSAPP_NUMERO + '?text=' + encodeURIComponent(textoWhatsApp);

    return {
      success: true,
      codigo_pedido: codigoPedido,
      fecha_creacion: fechaCreacionStr,
      fecha_vencimiento: fechaVencimientoStr,
      duracion_minutos: CONFIG.DURACION_RESERVA_MINUTOS,
      importe_total: totalCalculadoServidor,
      detalle: detalleParaGuardar,
      whatsapp_url: enlaceWhatsApp,
      whatsapp_mensaje: textoWhatsApp
    };

  } catch (err) {
    Logger.log('Error en crearReservaStock: ' + err);
    return {
      success: false,
      error: 'ERROR_SERVIDOR',
      message: 'Ocurrió un error inesperado al procesar la reserva: ' + err.message
    };
  } finally {
    if (lockAdquirido) {
      lock.releaseLock();
    }
  }
}

// ==========================================
// CONSTRUCCIÓN DEL MENSAJE DE WHATSAPP
// ==========================================
/**
 * Construye el mensaje con el formato y plantilla oficial exigida para Cliky.
 */
function construirMensajeWhatsApp(datos) {
  var lineas = [];
  lineas.push('Hola, Cliky. Quiero coordinar el pago de mi pedido.');
  lineas.push('Código del pedido: ' + datos.codigo_pedido);
  lineas.push('Nombre: ' + datos.nombre_cliente);
  lineas.push('Celular: ' + datos.telefono_cliente);
  lineas.push('DETALLE:');

  datos.detalle.forEach(function (item) {
    lineas.push(item.producto);
    lineas.push('Variante: ' + item.variante);
    lineas.push('Cantidad: ' + item.cantidad);
    lineas.push('Precio unitario: S/ ' + item.precio_unitario.toFixed(2));
    lineas.push('Subtotal: S/ ' + item.subtotal.toFixed(2));
  });

  lineas.push('Indicaciones adicionales: ' + (datos.observaciones || 'Ninguna'));
  lineas.push('TOTAL: S/ ' + datos.total.toFixed(2));
  lineas.push('Estado: pendiente de pago.');
  lineas.push('Reserva válida hasta: ' + datos.fecha_vencimiento_str + '.');
  lineas.push('Por favor, indíquenme cómo realizar el pago y coordinar la entrega.');

  return lineas.join('\n');
}

// ==========================================
// ADMINISTRACIÓN: CONFIRMACIÓN DE PAGO
// ==========================================
/**
 * Confirma el pago de un pedido:
 * 1. Verifica que la reserva existe.
 * 2. Verifica que no fue confirmada previamente.
 * 3. Si estaba vencida, vuelve a verificar si aún hay stock físico suficiente.
 * 4. Descuenta el stock físico una sola vez en la hoja Inventario.
 * 5. Actualiza el estado a 'PAGADO' y guarda fecha_pago.
 * 6. Registra en el Historial de Pagos.
 */
function procesarConfirmacionPago(codigoPedido) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaRes = ss.getSheetByName(CONFIG.HOJA_RESERVAS);
  var hojaInv = ss.getSheetByName(CONFIG.HOJA_INVENTARIO);
  var hojaHist = ss.getSheetByName(CONFIG.HOJA_HISTORIAL);

  if (!hojaRes || !hojaInv) {
    return { success: false, message: 'Hojas de Cliky no configuradas correctamente.' };
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (e) {
    return { success: false, message: 'El servidor está ocupado. Intenta de nuevo en unos segundos.' };
  }

  try {
    var dataRes = hojaRes.getDataRange().getValues();
    var headersRes = dataRes[0];

    var idxCodigo = headersRes.indexOf('codigo_pedido');
    var idxEstado = headersRes.indexOf('estado');
    var idxFechaPago = headersRes.indexOf('fecha_pago');
    var idxDetalle = headersRes.indexOf('detalle_productos');
    var idxTotal = headersRes.indexOf('importe_total');
    var idxNombre = headersRes.indexOf('nombre_cliente');
    var idxTelefono = headersRes.indexOf('telefono_cliente');

    var filaResIndex = -1;
    var estadoActual = '';
    var detalleStr = '';
    var totalPedido = 0;
    var nombreCli = '';
    var telCli = '';

    for (var r = 1; r < dataRes.length; r++) {
      if (String(dataRes[r][idxCodigo]).trim().toUpperCase() === String(codigoPedido).trim().toUpperCase()) {
        filaResIndex = r + 1;
        estadoActual = String(dataRes[r][idxEstado]).trim().toUpperCase();
        detalleStr = dataRes[r][idxDetalle];
        totalPedido = dataRes[r][idxTotal];
        nombreCli = dataRes[r][idxNombre];
        telCli = dataRes[r][idxTelefono];
        break;
      }
    }

    if (filaResIndex === -1) {
      return { success: false, message: 'No se encontró ninguna reserva con el código: ' + codigoPedido };
    }

    // Regla de seguridad: no permitir doble procesamiento
    if (estadoActual === 'PAGADO') {
      return { success: false, message: 'Esta reserva YA fue confirmada y pagada previamente. No se duplicó el descuento de inventario.' };
    }

    if (estadoActual === 'CANCELADO') {
      return { success: false, message: 'Esta reserva fue CANCELADA previamente. No se puede marcar como pagada.' };
    }

    var items = [];
    try {
      items = JSON.parse(detalleStr);
    } catch (e) {
      return { success: false, message: 'El detalle de productos de la reserva no tiene un formato válido.' };
    }

    // Leer inventario físico actual
    var dataInv = hojaInv.getDataRange().getValues();
    var headersInv = dataInv[0];
    var idxInvId = headersInv.indexOf('id_variante');
    var idxInvStock = headersInv.indexOf('stock_fisico');

    var invRowMap = {};
    for (var j = 1; j < dataInv.length; j++) {
      var sId = String(dataInv[j][idxInvId]).trim();
      if (sId) {
        invRowMap[sId] = {
          row: j + 1,
          stockActual: Number(dataInv[j][idxInvStock]) || 0
        };
      }
    }

    // Verificar si el stock físico alcanza para todos los ítems (en caso de que la reserva hubiese vencido)
    for (var k = 0; k < items.length; k++) {
      var itId = items[k].id_variante;
      var itCant = items[k].cantidad;
      if (!invRowMap[itId]) {
        return { success: false, message: 'El producto ' + itId + ' ya no existe en el inventario físico.' };
      }
      if (invRowMap[itId].stockActual < itCant) {
        return {
          success: false,
          message: 'Stock físico insuficiente para descontar el ítem ' + items[k].producto + ' (' + items[k].variante + '). Stock físico actual: ' + invRowMap[itId].stockActual + ', requerido: ' + itCant
        };
      }
    }

    // Descontar del stock físico una sola vez
    var resumenDescuento = [];
    for (var m = 0; m < items.length; m++) {
      var itemToDeduct = items[m];
      var infoInv = invRowMap[itemToDeduct.id_variante];
      var nuevoStock = infoInv.stockActual - itemToDeduct.cantidad;
      hojaInv.getRange(infoInv.row, idxInvStock + 1).setValue(nuevoStock);
      resumenDescuento.push(itemToDeduct.producto + ' (' + itemToDeduct.variante + '): -' + itemToDeduct.cantidad + ' (Quedan: ' + nuevoStock + ')');
    }

    // Actualizar estado en Reservas
    var ahoraDate = new Date();
    var fechaPagoStr = Utilities.formatDate(ahoraDate, CONFIG.ZONA_HORARIA, CONFIG.FORMATO_FECHA);

    hojaRes.getRange(filaResIndex, idxEstado + 1).setValue('PAGADO');
    hojaRes.getRange(filaResIndex, idxFechaPago + 1).setValue(fechaPagoStr);

    // Registrar en Historial
    if (hojaHist) {
      hojaHist.appendRow([
        'PAG-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        codigoPedido,
        fechaPagoStr,
        nombreCli,
        telCli,
        totalPedido,
        resumenDescuento.join(' | ')
      ]);
    }

    return {
      success: true,
      message: '¡Pago confirmado con éxito para el pedido ' + codigoPedido + '!\nSe descontó el stock físico correctamente.',
      codigo_pedido: codigoPedido,
      fecha_pago: fechaPagoStr,
      descuentos: resumenDescuento
    };

  } finally {
    lock.releaseLock();
  }
}

/**
 * Cancela una reserva manualmente desde administración, liberando las existencias.
 */
function procesarCancelacionReserva(codigoPedido) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaRes = ss.getSheetByName(CONFIG.HOJA_RESERVAS);
  if (!hojaRes) return { success: false, message: 'Hoja Reservas no encontrada.' };

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { success: false, message: 'Servidor ocupado. Intenta nuevamente.' };
  }

  try {
    var data = hojaRes.getDataRange().getValues();
    var headers = data[0];
    var idxCodigo = headers.indexOf('codigo_pedido');
    var idxEstado = headers.indexOf('estado');

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][idxCodigo]).trim().toUpperCase() === String(codigoPedido).trim().toUpperCase()) {
        var estadoActual = String(data[i][idxEstado]).trim().toUpperCase();
        if (estadoActual === 'PAGADO') {
          return { success: false, message: 'No se puede cancelar una reserva que ya figura como PAGADA.' };
        }
        hojaRes.getRange(i + 1, idxEstado + 1).setValue('CANCELADO');
        return { success: true, message: 'La reserva ' + codigoPedido + ' fue CANCELADA. El stock está disponible nuevamente.' };
      }
    }

    return { success: false, message: 'No se encontró la reserva ' + codigoPedido };
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// DIÁLOGOS DE INTERFAZ EN GOOGLE SHEETS
// ==========================================
function menuConfirmarPago() {
  var ui = SpreadsheetApp.getUi();
  var promptRes = ui.prompt(
    'Confirmar Pago de Pedido',
    'Ingresa el código del pedido de Cliky (ejemplo: CLK-ABC123):',
    ui.ButtonSet.OK_CANCEL
  );

  if (promptRes.getSelectedButton() !== ui.Button.OK) return;
  var codigo = promptRes.getResponseText().trim();
  if (!codigo) {
    ui.alert('Debes ingresar un código válido.');
    return;
  }

  var resultado = procesarConfirmacionPago(codigo);
  if (resultado.success) {
    ui.alert('Operación Exitosa', resultado.message, ui.ButtonSet.OK);
  } else {
    ui.alert('Atención', resultado.message, ui.ButtonSet.OK);
  }
}

function menuCancelarReserva() {
  var ui = SpreadsheetApp.getUi();
  var promptRes = ui.prompt(
    'Cancelar Reserva',
    'Ingresa el código de la reserva a cancelar:',
    ui.ButtonSet.OK_CANCEL
  );

  if (promptRes.getSelectedButton() !== ui.Button.OK) return;
  var codigo = promptRes.getResponseText().trim();
  if (!codigo) return;

  var resultado = procesarCancelacionReserva(codigo);
  ui.alert(resultado.success ? 'Reserva Cancelada' : 'Error', resultado.message, ui.ButtonSet.OK);
}

// ==========================================
// CONTROLADOR HTTP WEB APP (doGet y doPost)
// ==========================================
/**
 * Manejo de peticiones GET.
 * Parámetros soportados:
 * - action=getCatalog : Retorna el catálogo con precios oficiales y stock disponible en tiempo real.
 * - action=checkOrder&code=CLK-XXXXXX : Verifica el estado de un pedido.
 * - action=createReservation&data={...} : Permite crear reserva vía GET (alternativa para navegadores con restricciones CORS).
 */
function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};
  var action = params.action || 'getCatalog';
  var respuesta = {};

  try {
    if (action === 'getCatalog') {
      respuesta = obtenerCatalogoParaFrontend();
    } else if (action === 'checkOrder') {
      var codigo = params.code || '';
      respuesta = consultarEstadoPedido(codigo);
    } else if (action === 'createReservation') {
      // Fallback seguro en formato GET si el cliente envía payload serializado en URL
      var rawData = params.data || '{}';
      var payload = JSON.parse(rawData);
      respuesta = crearReservaStock(payload);
    } else if (action === 'confirmPayment') {
      // Protección: Solo si coincide con el token de admin
      if (params.adminToken === CONFIG.TOKEN_ADMIN_API) {
        respuesta = procesarConfirmacionPago(params.code);
      } else {
        respuesta = { success: false, message: 'Acceso no autorizado.' };
      }
    } else {
      respuesta = { success: false, message: 'Acción no reconocida: ' + action };
    }
  } catch (error) {
    respuesta = { success: false, error: 'EXCEPCION', message: error.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(respuesta))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Manejo de peticiones POST.
 * Procesa la creación de reservas con payload JSON.
 */
function doPost(e) {
  var respuesta = {};

  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      body = e.parameter;
    }

    var action = body.action || (e && e.parameter && e.parameter.action) || 'createReservation';

    if (action === 'createReservation') {
      respuesta = crearReservaStock(body);
    } else if (action === 'confirmPayment') {
      if (body.adminToken === CONFIG.TOKEN_ADMIN_API) {
        respuesta = procesarConfirmacionPago(body.code || body.codigo_pedido);
      } else {
        respuesta = { success: false, message: 'Acceso administrativo denegado.' };
      }
    } else if (action === 'cancelReservation') {
      if (body.adminToken === CONFIG.TOKEN_ADMIN_API) {
        respuesta = procesarCancelacionReserva(body.code || body.codigo_pedido);
      } else {
        respuesta = { success: false, message: 'Acceso administrativo denegado.' };
      }
    } else {
      respuesta = { success: false, message: 'Acción POST no reconocida: ' + action };
    }
  } catch (error) {
    respuesta = { success: false, error: 'POST_ERROR', message: error.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(respuesta))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Consulta el estado actual de un pedido por su código.
 */
function consultarEstadoPedido(codigoPedido) {
  if (!codigoPedido) return { success: false, message: 'Código requerido.' };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaRes = ss.getSheetByName(CONFIG.HOJA_RESERVAS);
  if (!hojaRes) return { success: false, message: 'Hoja de reservas no encontrada.' };

  limpiarReservasVencidas();

  var data = hojaRes.getDataRange().getValues();
  var headers = data[0];
  var idxCodigo = headers.indexOf('codigo_pedido');
  var idxEstado = headers.indexOf('estado');
  var idxVenc = headers.indexOf('fecha_vencimiento');
  var idxTotal = headers.indexOf('importe_total');

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idxCodigo]).trim().toUpperCase() === String(codigoPedido).trim().toUpperCase()) {
      return {
        success: true,
        codigo_pedido: data[i][idxCodigo],
        estado: data[i][idxEstado],
        fecha_vencimiento: data[i][idxVenc],
        importe_total: data[i][idxTotal]
      };
    }
  }

  return { success: false, message: 'Código de pedido no encontrado.' };
}
