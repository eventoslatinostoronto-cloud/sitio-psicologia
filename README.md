# Eucalipto Psicología — sitio web + portal de terapeutas

Sitio estático (HTML, CSS y JavaScript, sin instalación). Se puede publicar gratis en Netlify, Vercel o GitHub Pages arrastrando la carpeta.

## Páginas
| Archivo | Qué es |
|---|---|
| `index.html` | Inicio: presentación de la pareja, servicios, cómo funciona, preguntas, formulario |
| `colombia.html` | Terapia en Colombia (presencial en Bogotá + online nacional) |
| `exterior.html` | Terapia online para colombianos/latinos en el exterior, con conversor de horario |
| `admin.html` | Portal de terapeutas (no aparece en buscadores) |

## Lo que deben cambiar antes de publicar
1. **Contacto**: edita el bloque `CONFIG` al inicio de `assets/site.js` (WhatsApp, correo, dirección, horario).
2. **Nombres y textos**: "Mariana Ortiz" y "Daniel Restrepo" y la marca "Eucalipto" son de ejemplo. Búscalos y reemplázalos en los `.html`.
3. **Fotos**: ya están las fotos reales de la pareja (`pareja-laguna.jpg`, `pareja-casa.jpg`, `pareja-lago.jpg`, `esteban.jpg`, `companera.jpg`).
   Para las imágenes de stock, descarga fotos gratis de Unsplash o Pexels y guárdalas con estos nombres en `assets/img/` (mientras no existan se ve una ilustración):
   - `stock-consultorio.jpg` · busca "therapy office", "cozy armchair plants" (pestaña "Vivo en Colombia")
   - `stock-videollamada.jpg` · busca "video call laptop home", "online therapy" (pestaña "Vivo en el exterior")
   El nombre de ella aparece como "Mariana Ortiz" (provisional): reemplázalo en los `.html` y en Ajustes del portal.
   Antes: **Fotos**: pon sus fotos en `assets/img/` con estos nombres y aparecen solas:
   `mariana.jpg` y `daniel.jpg`. Las ilustraciones del consultorio (`consultorio.svg`, `sillon.svg`) se pueden reemplazar por fotos reales.
4. **PIN del portal**: entra con `1234` y cámbialo en Ajustes.

## Portal de terapeutas
- **Inicio**: sesiones de hoy, próximas, clientes que toca agendar según su frecuencia, solicitudes nuevas y pagos pendientes.
- **Agenda**: semana por terapeuta, clic en un hueco para agendar, muestra también los otros eventos de su Google Calendar.
- **Clientes**: ficha con datos, país y hora local, frecuencia, tarifa, motivo, notas, historial de sesiones con notas y pagos.
- **Sesiones**: agendar una o una serie (según frecuencia), crear link de Meet, enviar invitación al cliente, mover, cancelar y registrar pago.
- **Solicitudes**: lo que llega del formulario del sitio; un clic lo convierte en cliente.

### Conectar Google Calendar + Meet
1. En https://console.cloud.google.com crea un proyecto y activa **Google Calendar API**.
2. Configura la pantalla de consentimiento OAuth (tipo Externo) y agrega sus correos como usuarios de prueba.
3. Crea credenciales → **ID de cliente OAuth** → Aplicación web. En "Orígenes de JavaScript autorizados" pon el dominio del sitio (ej. `https://eucaliptopsicologia.com`).
4. En el portal → Ajustes → pega el Client ID → "Guardar y conectar".

Al agendar una sesión online se crea el evento en Google Calendar con link de Meet y Google le envía la invitación al cliente. Si mueven o cancelan la sesión, Google avisa al cliente.

## Importante: dónde se guardan los datos
Esta versión guarda clientes y sesiones **en el navegador** donde se usa el portal (con copia de seguridad descargable en Ajustes). Sirve para empezar, pero:
- Mariana y Daniel no verían los mismos datos desde computadores distintos.
- El formulario del sitio solo llega al portal si se abre en el mismo navegador. Para recibir solicitudes reales, pon una URL de Formspree (o similar) en `CONFIG.formEndpoint`; mientras tanto, el formulario abre WhatsApp como respaldo.
- El PIN no es seguridad real.

Para uso con pacientes reales (historia clínica, Ley 1581 de 2012 y Resolución 1995 de 1999) el siguiente paso es conectar el portal a una base de datos con inicio de sesión (por ejemplo Supabase o Firebase con login de Google). La estructura de datos ya está separada para facilitarlo.
