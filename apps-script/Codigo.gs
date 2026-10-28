/**
 * Recibe las respuestas del Clasificador de Decisiones TRG y las escribe en esta hoja de cálculo.
 *
 * Hoja "Respuestas": una fila por persona (avance, conteo por nivel y resumen en texto).
 * Hoja "Detalle": una fila por caso clasificado, para filtrar o hacer tablas dinámicas.
 *
 * Si la misma persona vuelve a enviar desde el mismo navegador, sus filas anteriores se reemplazan.
 */

const HOJA_RESPUESTAS = "Respuestas";
const HOJA_DETALLE = "Detalle";
const COLUMNAS_RESPUESTAS = ["Enviado", "Nombre", "Clasificados", "Sin clasificar", "Nivel 1", "Nivel 2", "Nivel 3", "Nivel 4", "Resumen", "ID"];
const COLUMNAS_DETALLE = ["Enviado", "Nombre", "Área", "Caso", "Nivel", "Nota", "Caso agregado", "ID"];
const NIVELES = {1: "1 · Decide sola", 2: "2 · Decide y avisa", 3: "3 · Consulta antes", 4: "4 · Escala de inmediato"};

function doGet() {
  return ContentService.createTextOutput("El servicio de respuestas del Clasificador de Decisiones está funcionando.");
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (err) {
    return json({ok: false, error: "Hay muchos envíos al mismo tiempo, intenta de nuevo"});
  }
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const id = String(d.id || "");
    if (!/^[A-Za-z0-9-]{8,64}$/.test(id) || !String(d.nombre || "").trim() || !Array.isArray(d.casos) || d.casos.length > 500) {
      return json({ok: false, error: "Datos incompletos"});
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const resp = hoja(ss, HOJA_RESPUESTAS, COLUMNAS_RESPUESTAS);
    const det = hoja(ss, HOJA_DETALLE, COLUMNAS_DETALLE);

    const fecha = new Date();
    const nombre = texto(d.nombre, 200);
    const cnt = {1: 0, 2: 0, 3: 0, 4: 0};
    d.casos.forEach(c => { if (cnt[c.nivel] !== undefined) cnt[c.nivel]++; });
    const hechos = cnt[1] + cnt[2] + cnt[3] + cnt[4];

    reemplazar(resp, id, COLUMNAS_RESPUESTAS.length, [[
      fecha, nombre, hechos, d.casos.length - hechos, cnt[1], cnt[2], cnt[3], cnt[4], texto(d.resumen, 45000), id
    ]]);
    reemplazar(det, id, COLUMNAS_DETALLE.length, d.casos.map(c => [
      fecha, nombre, texto(c.area, 200), texto(c.caso, 500), NIVELES[c.nivel] || "Sin clasificar",
      texto(c.nota, 1000), c.agregado ? "Sí" : "", id
    ]));
    return json({ok: true});
  } catch (err) {
    return json({ok: false, error: String(err && err.message || err)});
  } finally {
    lock.releaseLock();
  }
}

/** Borra las filas que ya tenía este id (la columna ID es la última) y agrega las nuevas al final. */
function reemplazar(sh, id, idCol, filas) {
  const n = sh.getLastRow() - 1;
  if (n > 0) {
    const ids = sh.getRange(2, idCol, n, 1).getValues();
    let fin = -1;
    for (let i = n - 1; i >= -1; i--) {
      const coincide = i >= 0 && ids[i][0] === id;
      if (coincide && fin < 0) fin = i;
      if (!coincide && fin >= 0) {
        // Sheets no permite borrar todas las filas debajo del encabezado: en ese caso solo se vacían
        if (i < 0 && fin === n - 1) sh.getRange(2, 1, n, sh.getLastColumn()).clearContent();
        else sh.deleteRows(i + 3, fin - i);
        fin = -1;
      }
    }
  }
  if (filas.length) sh.getRange(sh.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas);
}

function hoja(ss, nombre, columnas) {
  let sh = ss.getSheetByName(nombre);
  if (!sh) {
    sh = ss.insertSheet(nombre);
    sh.getRange(1, 1, 1, columnas.length).setValues([columnas]).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}

/** Texto plano y recortado; si empieza con = + - @ se antepone ' para que la hoja no lo tome como fórmula. */
function texto(v, max) {
  let s = String(v == null ? "" : v).slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
