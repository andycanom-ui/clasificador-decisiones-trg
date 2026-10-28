# Clasificador de Decisiones TRG

Página para que cada gerente de sucursal clasifique situaciones en los cuatro niveles de la Matriz de Decisiones (decide sola, decide y avisa, consulta antes, escala de inmediato) y envíe sus respuestas. Quien responde no necesita cuenta de nada: solo abre el link.

Las respuestas llegan a una hoja de Google Sheets tuya:

- **Respuestas**: una fila por persona, con su avance, cuántos casos puso en cada nivel y el resumen completo en texto.
- **Detalle**: una fila por caso (persona, área, caso, nivel, nota), lista para filtrar o hacer tablas dinámicas.

Si alguien vuelve a enviar desde el mismo navegador, su respuesta anterior se reemplaza en lugar de duplicarse.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La página del clasificador |
| `config.js` | Dónde se pega la URL que recibe las respuestas |
| `apps-script/Codigo.gs` | El código que recibe las respuestas y las escribe en la hoja |

## Puesta en marcha (una sola vez)

### 1. Crear la hoja que recibe las respuestas

1. Crea una hoja de cálculo nueva en Google Sheets, por ejemplo "Respuestas Matriz de Decisiones".
2. En la hoja, ve a **Extensiones → Apps Script**.
3. Borra lo que aparece en el editor, pega todo el contenido de [`apps-script/Codigo.gs`](apps-script/Codigo.gs) y guarda.
4. Arriba a la derecha: **Implementar → Nueva implementación**.
   - En el engrane de "Seleccionar tipo", elige **Aplicación web**.
   - **Ejecutar como**: Yo.
   - **Quién tiene acceso**: Cualquier usuario.
   - Da clic en **Implementar** y autoriza los permisos que pide Google. Si aparece "Google no verificó esta app", entra a "Configuración avanzada" y luego a "Ir a … (no seguro)": es tu propio script.
5. Copia la **URL de la aplicación web**. Termina en `/exec`.

Para comprobar que funciona, abre esa URL en el navegador. Debe decir "El servicio de respuestas del Clasificador de Decisiones está funcionando."

### 2. Conectar la página con la hoja

1. En GitHub, abre `config.js` y da clic en el lápiz (editar).
2. Pega la URL entre las comillas:
   ```js
   window.CLASIFICADOR_ENDPOINT = "https://script.google.com/macros/s/…/exec";
   ```
3. Da clic en **Commit changes**.

### 3. Publicar la página

1. En el repositorio, ve a **Settings → Pages**.
2. En **Source** elige **Deploy from a branch**, rama **main** y carpeta **/ (root)**. Guarda.
3. En uno o dos minutos aparece arriba el link, algo como `https://<tu-usuario>.github.io/clasificador-decisiones-trg/`. Ese es el link para los gerentes.

Haz una prueba: llena un par de casos, escribe tu nombre, envía y revisa que aparezca en la hoja.

## Notas

- **Si cambias el código de `Codigo.gs`**, vuelve a publicarlo en **Implementar → Administrar implementaciones → editar (lápiz) → Versión: Nueva versión**. Así la URL sigue siendo la misma.
- **Mientras alguien trabaja**, sus respuestas se guardan en su navegador. Si cierra la página y vuelve desde el mismo dispositivo, las encuentra como las dejó.
- **El repositorio es público** (GitHub Pages lo requiere en el plan gratuito), así que cualquiera puede ver la página y la lista de casos. Las respuestas no quedan aquí: solo están en tu hoja de Google.
- **Para cambiar los casos**, edita la lista `DATA` dentro de `index.html`.
