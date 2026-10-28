# Sitio Eucalipto Psicología (provisional)

Sitio estático para una pareja de psicólogos (Esteban Martínez y su pareja, nombre de ella pendiente).
Terapia presencial en Bogotá y online para colombianos en el exterior. Todo en español.

## Estructura
- `index.html`, `colombia.html`, `exterior.html`: se GENERAN con `python3 tools/build.py`. Edita los textos en `tools/build.py`, no en los .html.
- `admin.html` + `assets/admin.js` + `assets/admin.css`: portal de terapeutas (clientes, agenda, Google Calendar + Meet). Datos en localStorage.
- `assets/styles.css`: diseño (estilo Therapix, lila #9384d6 + azul marino #26304f, fuente Manrope). El portal reutiliza estos tokens.
- `assets/site.js`: bloque `CONFIG` con WhatsApp, correo, dirección y horarios.
- `assets/img/`: fotos reales de la pareja. `stock-consultorio.jpg` y `stock-videollamada.jpg` aún no existen (se muestra una ilustración).

## Pendientes
- Nombre real de ella (hoy "Mariana Ortiz", provisional) y foto profesional suya.
- Nombre de marca definitivo (hoy "Eucalipto"), WhatsApp, correo y dirección reales.
- Bios, enfoque y especialidades reales de ambos.
- Base de datos real para el portal (p. ej. Supabase) antes de guardar datos de pacientes.

## Vista previa
Publicado en GitHub Pages desde la rama `main` (raíz del repo).
