import os
import pathlib
OUT=str(pathlib.Path(__file__).resolve().parent.parent)+'/'
ARROW='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 17 17 7M9 7h8v8"/></svg>'
CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16 10"/></svg>'
LEAF='<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M32 61V24"/><path d="M32 46c-11 1-19-6-20-17 11-1 19 6 20 17Z"/><path d="M32 38c11 1 19-6 20-17-11-1-19 6-20 17Z"/><path d="M32 24c-6-5-7-13-1-20 6 7 6 15 1 20Z"/></svg>'
WA='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.1L4 20Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5"/></svg>'
L='fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"'
SVC_ICONS={
 'ind':f'<svg viewBox="0 0 60 60" {L}><circle cx="30" cy="18" r="8"/><path d="M14 50c2-11 8-17 16-17s14 6 16 17"/><path d="M40 12c4 1 7 4 7 9M44 8c6 2 10 8 9 15"/></svg>',
 'par':f'<svg viewBox="0 0 60 60" {L}><circle cx="21" cy="18" r="7"/><circle cx="40" cy="18" r="7"/><path d="M8 50c1-10 6-16 13-16 4 0 7 2 9 5 2-3 5-5 10-5 7 0 12 6 13 16"/><path d="M30 26c-2-3-6-2-6 1 0 3 6 6 6 6s6-3 6-6c0-3-4-4-6-1z"/></svg>',
 'mig':f'<svg viewBox="0 0 60 60" {L}><circle cx="30" cy="30" r="20"/><path d="M10 30h40M30 10c6 6 8 13 8 20s-2 14-8 20c-6-6-8-13-8-20s2-14 8-20z"/><path d="M44 8l8-2-2 8M52 6 42 16"/></svg>',
 'ans':f'<svg viewBox="0 0 60 60" {L}><path d="M30 52c12 0 20-8 20-20 0-9-6-16-14-19-2 6-8 8-8 8s4-9-2-14C17 10 10 20 10 32c0 12 8 20 20 20z"/><path d="M22 36c2 4 5 6 8 6s6-2 8-6"/></svg>',
 'fam':f'<svg viewBox="0 0 60 60" {L}><path d="M8 28 30 10l22 18"/><path d="M14 24v26h32V24"/><circle cx="24" cy="32" r="4"/><circle cx="36" cy="32" r="4"/><circle cx="30" cy="41" r="3"/><path d="M18 50c1-6 3-9 6-9M42 50c-1-6-3-9-6-9"/></svg>',
 'due':f'<svg viewBox="0 0 60 60" {L}><path d="M30 54V26"/><path d="M30 38c-10 0-16-7-16-16 10 0 16 7 16 16z"/><path d="M30 32c10 0 16-7 16-16-10 0-16 7-16 16z"/><path d="M20 54h20"/></svg>',
}
SERVICES=[
 ('ind','Terapia individual','Ansiedad, estrés, autoestima o momentos de cambio. Un espacio solo para ti.'),
 ('par','Terapia de pareja','Comunicación, crisis, infidelidad o distancia. Puedes tomarla con los dos.'),
 ('mig','Duelo migratorio','Extrañar, adaptarte, no terminar de llegar. Online desde cualquier país.'),
 ('ans','Ansiedad y estrés','Herramientas concretas y espacio para entender lo que te desborda.'),
 ('fam','Familia','Crianza, convivencia y familias que viven separadas entre países.'),
 ('due','Duelo y pérdidas','Una muerte, una ruptura, una etapa. Un lugar para hacerle espacio al dolor.'),
]

def head(title, desc):
    return f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="{desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="assets/styles.css">
</head>
<body>
'''
def logo():
    return f'<a class="logo" href="index.html" aria-label="Eucalipto Psicología, inicio"><span class="logo-mark">{LEAF}</span><span>Eucalipto<small>Psicología</small></span></a>'
def header(cur):
    links=[('index.html','Inicio'),('colombia.html','En Colombia'),('exterior.html','En el exterior'),('index.html#nosotros','Nosotros'),('index.html#preguntas','Preguntas')]
    m=''.join(f'<a href="{h}"{" aria-current=\"page\"" if h==cur else ""}>{t}</a>' for h,t in links)
    mm=''.join(f'<a href="{h}">{t}</a>' for h,t in links)+'<a href="#agendar">Agendar cita</a><a href="admin.html">Portal de terapeutas</a>'
    return f'''<header class="topbar">
  <div class="wrap">
    {logo()}
    <nav class="menu" aria-label="Principal">{m}</nav>
    <a class="phone" data-wa="Hola, quisiera información sobre la terapia." href="#"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg><span data-config="whatsappLabel">WhatsApp</span></a>
    <a class="btn btn-navy" href="#agendar">Agendar cita</a>
    <button class="menu-btn" type="button" aria-label="Abrir menú" aria-expanded="false" data-menu-btn><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 8h14M5 12h14M5 16h14"/></svg></button>
  </div>
  <nav class="wrap mobile-menu" data-menu aria-label="Menú móvil">{mm}</nav>
</header>
'''
def hero(eyebrow, h1, text, cta_wa, extra_cls='', card=True, photo=None):
    fc=''
    art=f'<img class="hero-photo" src="assets/img/{photo}" alt="Mariana y Esteban, psicólogos, en la laguna">' if photo else '<img class="hero-art" src="assets/img/consultorio.svg" alt="" aria-hidden="true">'
    return f'''<section class="hero {extra_cls}">
  {art}
  <div class="wrap">
    <div class="hero-copy">
      <span class="eyebrow">{eyebrow}</span>
      <h1 class="display">{h1}</h1>
      <p>{text}</p>
      <div class="hero-actions">
        <a class="btn btn-lav" href="#agendar">Agendar primera cita</a>
        <a class="btn btn-arrow" href="#agendar" aria-label="Ir a agendar">{ARROW}</a>
        <a class="btn btn-ghost" data-wa="{cta_wa}" href="#">Escribir por WhatsApp</a>
      </div>
    </div>
  </div>
  {fc}
</section>
'''
def contact():
    return '''<section class="section" id="agendar">
  <div class="wrap">
    <div class="contact-box">
      <div class="stack">
        <span class="eyebrow">Agenda tu cita</span>
        <h2 class="h2">¿Necesitas apoyo? Llena el formulario.</h2>
        <p class="lead">Déjanos tus datos y te escribimos el mismo día hábil para coordinar una llamada inicial.</p>
        <ul class="contact-list" style="width:100%">
          <li><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.1L4 20Z"/></svg></span><span><small>WhatsApp</small><b data-config="whatsappLabel"></b></span></li>
          <li><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg></span><span><small>Correo</small><b data-config="email"></b></span></li>
          <li><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 21c-5-3-8-7-8-11a8 8 0 0 1 16 0c0 4-3 8-8 11Z"/><circle cx="12" cy="10" r="2.5"/></svg></span><span><small>Presencial</small><b data-config="address"></b></span></li>
        </ul>
      </div>
      <div>
        <form class="form" data-booking-form novalidate>
          <div class="row">
            <div class="field"><label for="f-name">Nombre</label><input id="f-name" name="name" autocomplete="name" required placeholder="¿Cómo te llamas?"></div>
            <div class="field"><label for="f-email">Correo</label><input id="f-email" name="email" type="email" autocomplete="email" required placeholder="tu@correo.com"></div>
          </div>
          <div class="row">
            <div class="field"><label for="f-phone">WhatsApp</label><input id="f-phone" name="phone" type="tel" autocomplete="tel" placeholder="+57 …"></div>
            <div class="field"><label for="f-country">¿Dónde vives?</label>
              <select id="f-country" name="country"><option>Colombia</option><option>España</option><option>Estados Unidos</option><option>Canadá</option><option>México</option><option>Chile</option><option>Argentina</option><option>Perú</option><option>Reino Unido</option><option>Alemania</option><option>Francia</option><option>Italia</option><option>Países Bajos</option><option>Australia</option><option>Otro país</option></select></div>
          </div>
          <div class="field"><span class="field-label">Modalidad</span>
            <div class="segmented">
              <input type="radio" name="modality" id="m-online" value="Online" checked><label for="m-online">Online</label>
              <input type="radio" name="modality" id="m-pres" value="Presencial"><label for="m-pres">Presencial en Bogotá</label>
              <input type="radio" name="modality" id="m-nose" value="Por definir"><label for="m-nose">Aún no sé</label>
            </div></div>
          <div class="row">
            <div class="field"><label for="f-therapy">Tipo de terapia</label><select id="f-therapy" name="therapy"><option>Individual</option><option>Pareja</option><option>Familia</option><option>No estoy seguro/a</option></select></div>
            <div class="field"><label for="f-pref">Prefiero con</label><select id="f-pref" name="preference"><option value="Sin preferencia">Sin preferencia</option><option>Mariana</option><option>Esteban</option><option>Los dos (pareja)</option></select></div>
          </div>
          <div class="field"><label for="f-msg">Cuéntanos un poco (opcional)</label><textarea id="f-msg" name="message" placeholder="¿Qué te gustaría trabajar? ¿Qué horarios te sirven?"></textarea></div>
          <input type="hidden" name="timezone">
          <p class="fine error" data-form-error hidden>Escribe tu nombre y tu correo para poder responderte.</p>
          <button class="btn btn-lav" type="submit" style="justify-self:start">Enviar solicitud</button>
          <p class="fine">Tus datos solo se usan para contactarte. Si estás en una emergencia, llama a la Línea 106 (Bogotá) o al número de emergencias de tu país.</p>
        </form>
        <div class="form form-success" data-form-success hidden>
          <span class="check"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17l9-10"/></svg></span>
          <h3 class="h3">Gracias, <span data-success-name></span>. Recibimos tu solicitud.</h3>
          <p class="muted">Te escribimos pronto para coordinar la llamada inicial. Si prefieres, envíanos el mensaje también por WhatsApp.</p>
          <a class="btn btn-outline" data-success-wa href="#" target="_blank" rel="noopener" style="justify-self:start">Continuar por WhatsApp</a>
        </div>
      </div>
    </div>
  </div>
</section>
'''
def footer():
    return f'''<footer class="footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>{logo()}<p>Mariana y Esteban, pareja de psicólogos. Terapia presencial en Bogotá y online en español desde cualquier lugar del mundo.</p></div>
      <div><h4>Terapia</h4><ul><li><a href="colombia.html">En Colombia</a></li><li><a href="exterior.html">Desde el exterior</a></li><li><a href="index.html#servicios">Servicios</a></li><li><a href="index.html#preguntas">Preguntas</a></li></ul></div>
      <div><h4>Contacto</h4><ul><li><span data-config="whatsappLabel" style="color:var(--on-dark-soft)"></span></li><li><span data-config="email" style="color:var(--on-dark-soft);word-break:break-word"></span></li><li><a href="https://www.instagram.com/psi.esteban_martinez/" target="_blank" rel="noopener">Instagram de Esteban</a></li><li><a href="admin.html">Portal de terapeutas</a></li></ul></div>
      <div class="footer-cta"><h4>¿Empezamos a conversar?</h4><p>La primera llamada es para conocernos y resolver tus dudas.</p><a class="btn btn-light" href="#agendar">Agendar cita</a></div>
    </div>
    <div class="footer-bottom"><span>© <span data-year></span> Eucalipto Psicología</span><span>Hecho con calma en Bogotá</span></div>
  </div>
</footer>
<a class="wa-float" data-wa="Hola, quisiera información sobre la terapia." href="#" aria-label="Escribir por WhatsApp">{WA}</a>
<script src="assets/site.js"></script>
</body>
</html>
'''
def svc_card(k,t,d):
    return f'<article class="svc"><span class="ico">{SVC_ICONS[k]}</span><h3>{t}</h3><p>{d}</p><a class="link-more" href="#agendar">Agendar {ARROW}</a></article>'

MARQUEE_ITEMS=['Terapia individual','Terapia de pareja','Duelo migratorio','Ansiedad','Familia','Online desde cualquier país']
marquee='<div class="marquee" aria-hidden="true"><div class="marquee-track">'+''.join(f'<span>{x}</span>' for x in MARQUEE_ITEMS*2)+'</div></div>'

FAQ='''<div class="faq">
  <details open><summary>¿La terapia online funciona igual que la presencial?</summary><p>Sí. Los estudios muestran resultados comparables para la mayoría de motivos de consulta. Lo importante es tener un lugar privado, buena conexión y audífonos.</p></details>
  <details><summary>¿Qué plataforma usan para las videollamadas?</summary><p>Google Meet. Recibes una invitación de calendario con el link y entras desde el navegador o el celular, sin instalar nada.</p></details>
  <details><summary>Vivo fuera de Colombia, ¿cómo pago?</summary><p>Te enviamos opciones de pago internacional al confirmar la cita. Las tarifas para el exterior se manejan en dólares o euros.</p></details>
  <details><summary>¿Puedo elegir con quién de los dos tomar terapia?</summary><p>Claro. También puedes empezar con uno y, si es terapia de pareja, sumar sesiones con los dos.</p></details>
  <details><summary>¿Qué pasa con mi información?</summary><p>Todo es confidencial. Tus datos se manejan según la Ley 1581 de 2012 de protección de datos y la normativa de historia clínica.</p></details>
  <details><summary>¿Cada cuánto son las sesiones?</summary><p>Lo usual es semanal o cada quince días, de 50 minutos. Lo definimos juntos según lo que necesites.</p></details>
</div>'''

def ph(initial, img, alt='', cls=''):
    return f'<div class="ph {cls}"><span class="initial">{initial}</span><img src="assets/img/{img}" alt="{alt}" onerror="this.remove()"></div>'

# ================= INDEX =================
index = head('Eucalipto Psicología','Pareja de psicólogos. Terapia individual, de pareja y familiar, presencial en Bogotá y online por videollamada para colombianos en el exterior.') + header('index.html') + '<main>\n' + hero(
 'Psicología en pareja','Encuentra calma, claridad y bienestar.',
 'Somos Mariana y Esteban, pareja en la vida y en la consulta. Te acompañamos presencialmente en Bogotá y por videollamada desde cualquier lugar del mundo, siempre en español.',
 'Hola, quisiera información sobre la terapia.', photo='pareja-laguna.jpg') + f'''
<section class="section blush">
  <div class="wrap split">
    <div class="about-art">
      <img class="about-photo" src="assets/img/pareja-casa.jpg" alt="Mariana y Esteban sonriendo en casa">
      <div class="award"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg><b>Juntos</b>en la vida y en la consulta</div>
    </div>
    <div class="stack">
      <span class="eyebrow">Sobre nosotros</span>
      <h2 class="h2">Te acompañamos a sanar, crecer y volver a ti.</h2>
      <p class="lead">Somos una pareja de psicólogos clínicos. Creamos un espacio cálido y sin juicios para que hables de lo que te pesa, estés en Colombia o al otro lado del mundo.</p>
      <div class="feature-list">
        <div class="feat"><span class="ico">{SVC_ICONS["par"]}</span><div><h3>Dos miradas que se complementan</h3><p>Puedes elegir con quién trabajar, o tomar terapia de pareja con los dos.</p></div></div>
        <div class="feat"><span class="ico">{SVC_ICONS["mig"]}</span><div><h3>Cerca, aunque estés lejos</h3><p>Sesiones por Google Meet en un horario que se ajusta a tu zona.</p></div></div>
      </div>
      <div class="about-cta">
        <a class="btn btn-lav" href="#nosotros">Conócenos</a>
        <div class="avatars"><span class="row"><i style="background:#9384d6">M</i><i style="background:#26304f">E</i></span><span><b>Mariana y Esteban</b>psicólogos clínicos</span></div>
      </div>
    </div>
  </div>
</section>
{marquee}

<section class="section" id="servicios">
  <div class="wrap svc-grid">
    <div class="svc-intro">
      <span class="eyebrow">Servicios</span>
      <h2 class="h2">Cuidado cercano para tu mente y tus emociones.</h2>
      <p class="lead">Terapia con enfoque humano y basada en evidencia, para sentirte mejor en tu día a día.</p>
    </div>
    {"".join(svc_card(*s) for s in SERVICES)}
  </div>
</section>

<section class="navy-panel" id="modalidades">
  <div class="wrap">
    <div class="center">
      <span class="eyebrow">Dos formas de empezar</span>
      <h2 class="h2">¿Desde dónde nos escribes?</h2>
      <div class="tabs" role="tablist" data-tabs>
        <button role="tab" aria-selected="true" aria-controls="tab-col" id="t-col" type="button">Vivo en Colombia</button>
        <button role="tab" aria-selected="false" aria-controls="tab-ext" id="t-ext" type="button">Vivo en el exterior</button>
      </div>
    </div>
    <div class="tab-panel" id="tab-col" role="tabpanel" aria-labelledby="t-col">
      <div class="stack">
        <h3 class="h2" style="font-size:clamp(1.6rem,3vw,2.3rem)">Presencial en Bogotá u online en todo el país.</h3>
        <ul class="checks">
          <li>{CHECK}<span>Consultorio tranquilo y privado, con cita puntual.</span></li>
          <li>{CHECK}<span>Videollamada si estás en Medellín, Cali, Barranquilla o cualquier ciudad.</span></li>
          <li>{CHECK}<span>Puedes alternar sesiones presenciales y online.</span></li>
        </ul>
        <a class="btn btn-lav" href="colombia.html">Ver terapia en Colombia</a>
      </div>
      <div class="tab-art"><img src="assets/img/stock-consultorio.jpg" alt="Consultorio en Bogotá" onerror="this.onerror=null;this.src='assets/img/consultorio.svg'"></div>
    </div>
    <div class="tab-panel" id="tab-ext" role="tabpanel" aria-labelledby="t-ext" hidden>
      <div class="stack">
        <h3 class="h2" style="font-size:clamp(1.6rem,3vw,2.3rem)">Terapia en español para colombianos y latinos fuera del país.</h3>
        <ul class="checks">
          <li>{CHECK}<span>Sesiones por Google Meet, con el link en tu correo.</span></li>
          <li>{CHECK}<span>Horarios ajustados a tu zona horaria.</span></li>
          <li>{CHECK}<span>Duelo migratorio, adaptación, soledad y pareja a distancia.</span></li>
        </ul>
        <div class="clocks">
          <div class="clock"><b data-clock="America/Bogota">--:--</b><span>Bogotá, Colombia</span></div>
          <div class="clock"><b data-clock="local">--:--</b><span data-local-name>Tu hora</span></div>
        </div>
        <a class="btn btn-lav" href="exterior.html">Ver terapia en el exterior</a>
      </div>
      <div class="tab-art"><img src="assets/img/stock-videollamada.jpg" alt="Sesión de terapia por videollamada" onerror="this.onerror=null;this.src='assets/img/consultorio.svg'"></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="center">
      <span class="eyebrow">Cómo funciona</span>
      <h2 class="h2">Pasos sencillos para empezar tu proceso.</h2>
    </div>
    <ol class="path">
      <li><span class="dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.1L4 20Z"/></svg></span><small>Paso 1</small><h3>Nos escribes</h3><p>Por el formulario o WhatsApp, con lo que quieras contar.</p></li>
      <li><span class="dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg></span><small>Paso 2</small><h3>Llamada inicial</h3><p>Nos conocemos y elegimos modalidad, horario y terapeuta.</p></li>
      <li><span class="dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="13" height="12" rx="3"/><path d="m16 10 5-3v10l-5-3"/></svg></span><small>Paso 3</small><h3>Primera sesión</h3><p>En el consultorio o por Meet, con el link en tu correo.</p></li>
      <li><span class="dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M12 14c-4 0-6-3-6-6 4 0 6 3 6 6Z"/><path d="M12 12c4 0 6-3 6-6-4 0-6 3-6 6Z"/></svg></span><small>Paso 4</small><h3>Tu proceso</h3><p>Sesiones semanales o quincenales, a tu ritmo.</p></li>
    </ol>
  </div>
</section>

<section class="wrap" style="padding-bottom:clamp(64px,9vw,110px)">
  <div class="navy-panel round" style="padding-inline:clamp(22px,5vw,64px)">
    <div class="couple">
      <div class="stack">
        <span class="eyebrow">¿Por qué en pareja?</span>
        <h2 class="h2">Empatía en cada paso, con dos psicólogos que se conocen.</h2>
        <p class="lead">Sabemos por experiencia propia lo que es construir una relación, y lo que cuesta. Trabajar juntos nos permite ofrecer algo poco común.</p>
        <ul class="checks">
          <li>{CHECK}<span><b>Co-terapia de pareja:</b> sesiones con los dos para que ambas partes se sientan escuchadas.</span></li>
          <li>{CHECK}<span><b>Eliges con quién:</b> hay personas que se sienten más cómodas con una mujer o con un hombre.</span></li>
          <li>{CHECK}<span><b>Supervisión entre colegas:</b> revisamos casos juntos, con total confidencialidad.</span></li>
        </ul>
      </div>
      <div class="couple-photo"><img src="assets/img/pareja-lago.jpg" alt="Mariana y Esteban en un paseo"><span class="tag">Pareja en la vida y en la consulta</span></div>
    </div>
  </div>
</section>

<section class="section blush" id="nosotros">
  <div class="wrap">
    <div class="center">
      <span class="eyebrow">Nuestro equipo</span>
      <h2 class="h2">Conócenos antes de tu primera sesión.</h2>
    </div>
    <div class="team">
      <article class="member">{ph("M","companera.jpg","Retrato de Mariana Ortiz")}<h3>Mariana Ortiz</h3><span class="role">Psicóloga clínica</span><p>Acompaña a adultos en procesos de ansiedad, duelo y cambios de vida. Ha trabajado de cerca con personas que migraron y con quienes se quedaron en Colombia.</p><div class="chips"><span class="chip">Ansiedad</span><span class="chip">Duelo migratorio</span><span class="chip">Autoestima</span></div></article>
      <article class="member">{ph("E","esteban.jpg","Retrato de Esteban Martínez","navy")}<h3>Esteban Martínez</h3><span class="role">Psicólogo clínico</span><p>Trabaja con parejas y familias, y con hombres que quieren hablar de lo que sienten sin sentirse juzgados. Cree en la terapia práctica, con tareas claras.</p><div class="chips"><span class="chip">Pareja</span><span class="chip">Familia</span><span class="chip">Salud emocional masculina</span></div></article>
    </div>
  </div>
</section>

<section class="section" id="preguntas">
  <div class="wrap split" style="align-items:start">
    <div class="stack">
      <span class="eyebrow">Preguntas frecuentes</span>
      <h2 class="h2">Lo que suelen preguntarnos.</h2>
      <p class="lead">Si tu duda no está aquí, escríbenos. Respondemos con gusto.</p>
      <a class="btn btn-navy" data-wa="Hola, tengo una pregunta sobre la terapia." href="#">Preguntar por WhatsApp</a>
    </div>
    {FAQ}
  </div>
</section>
''' + contact() + '</main>\n' + footer()
open(OUT+'index.html','w').write(index)

# ================= COLOMBIA =================
col = head('Terapia en Colombia · Eucalipto','Terapia psicológica presencial en Bogotá y online en toda Colombia. Individual, pareja y familia.') + header('colombia.html') + '<main>\n' + hero(
 'Terapia en Colombia','Presencial en Bogotá, online en todo el país.',
 'Ven al consultorio o conéctate desde tu casa. Muchas personas alternan: presencial cuando pueden y online cuando la semana se complica.',
 'Hola, vivo en Colombia y quisiera agendar una cita.','page-hero',False) + f'''
<section class="section">
  <div class="wrap doors">
    <div class="door home">
      <span class="eyebrow">Presencial</span>
      <h2 class="h3">Consultorio en Bogotá</h2>
      <ul><li><span data-config="address">Consultorio en Bogotá</span></li><li>Espacio privado, tranquilo y con buena luz</li><li>Ideal para terapia de pareja y familia con los dos</li><li>Lunes a viernes y sábados en la mañana</li></ul>
    </div>
    <div class="door away">
      <span class="eyebrow">Online</span>
      <h2 class="h3">Por Google Meet, desde cualquier ciudad</h2>
      <ul><li>Medellín, Cali, Barranquilla, Bucaramanga o donde estés</li><li>Recibes la invitación con el link en tu correo</li><li>Solo necesitas un lugar privado y audífonos</li><li>Mismo proceso que en consultorio</li></ul>
    </div>
  </div>
</section>
{marquee}
<section class="section blush">
  <div class="wrap split" style="align-items:start">
    <div class="stack">
      <span class="eyebrow">Motivos de consulta</span>
      <h2 class="h2">Lo que más trabajamos con personas en Colombia.</h2>
      <p class="lead">Si no ves aquí lo que te pasa, escríbenos igual. En la llamada inicial te decimos con honestidad si podemos ayudarte o a quién referirte.</p>
    </div>
    <div class="list-grid">
      <div><h3>Ansiedad y estrés laboral</h3><p>Cuando el trabajo, la ciudad y el ritmo te sobrepasan.</p></div>
      <div><h3>Crisis de pareja</h3><p>Discusiones que se repiten, distancia, infidelidad o decisiones de futuro.</p></div>
      <div><h3>Familia que se fue</h3><p>Hijos, padres o hermanos que migraron y el vacío que dejan.</p></div>
      <div><h3>Duelo</h3><p>Pérdidas de personas, relaciones o etapas de la vida.</p></div>
      <div><h3>Autoestima</h3><p>Volver a tratarte con amabilidad y poner límites.</p></div>
      <div><h3>Crianza y convivencia</h3><p>Acuerdos en casa, adolescentes y familias reconstituidas.</p></div>
    </div>
  </div>
</section>
''' + contact() + '</main>\n' + footer()
open(OUT+'colombia.html','w').write(col)

# ================= EXTERIOR =================
opts=[('Europe/Madrid','España'),('America/New_York','Estados Unidos (Este: Nueva York, Miami)'),('America/Chicago','Estados Unidos (Centro: Chicago, Houston)'),('America/Los_Angeles','Estados Unidos (Pacífico: Los Ángeles)'),('America/Toronto','Canadá (Toronto, Montreal)'),('America/Vancouver','Canadá (Vancouver)'),('America/Mexico_City','México'),('America/Santiago','Chile'),('America/Argentina/Buenos_Aires','Argentina'),('America/Lima','Perú'),('Europe/London','Reino Unido'),('Europe/Berlin','Alemania'),('Europe/Paris','Francia'),('Europe/Rome','Italia'),('Europe/Amsterdam','Países Bajos'),('Australia/Sydney','Australia (Sídney)')]
ext = head('Terapia en el exterior · Eucalipto','Terapia psicológica online en español para colombianos y latinos que viven en el exterior. Duelo migratorio, adaptación, pareja.') + header('exterior.html') + '<main>\n' + hero(
 'Colombianos en el exterior','Terapia en tu idioma, estés donde estés.',
 'Hablar de lo que sientes es más fácil en español y con alguien que entiende de dónde vienes. Sesiones por videollamada, en un horario que se ajusta a tu zona.',
 'Hola, vivo fuera de Colombia y quisiera información sobre terapia online.','page-hero',False) + f'''
<section class="section blush">
  <div class="wrap split" style="align-items:start">
    <div class="stack">
      <span class="eyebrow">Migrar también se siente</span>
      <h2 class="h2">Irse es valiente. Y también puede doler.</h2>
      <p class="lead">El duelo migratorio es real: extrañas a tu gente, la comida, el idioma, quién eras allá. A veces todo va bien por fuera y por dentro no tanto. Para eso estamos.</p>
    </div>
    <div class="list-grid">
      <div><h3>Duelo migratorio</h3><p>Extrañar, sentir que no terminas de llegar ni de irte.</p></div>
      <div><h3>Adaptación y choque cultural</h3><p>Nuevo idioma, nuevas reglas y menos red de apoyo.</p></div>
      <div><h3>Soledad</h3><p>Construir vínculos de nuevo cuando todo es distinto.</p></div>
      <div><h3>Pareja migrante o a distancia</h3><p>Cuando uno se fue primero, o los dos llegaron y la relación cambió.</p></div>
      <div><h3>Culpa y familia en Colombia</h3><p>Padres que envejecen lejos, fechas especiales y decisiones difíciles.</p></div>
      <div><h3>Pensar en volver</h3><p>El retorno también es un proceso y merece acompañamiento.</p></div>
    </div>
  </div>
</section>
{marquee}
<section class="section">
  <div class="wrap split" style="align-items:start">
    <div class="stack">
      <span class="eyebrow">Horarios</span>
      <h2 class="h2">Encuentra tu hora.</h2>
      <p class="lead">Atendemos en hora de Colombia. Elige tu país y mira a qué hora te queda.</p>
      <div class="clocks light">
        <div class="clock"><b data-clock="America/Bogota">--:--</b><span>Bogotá, Colombia</span></div>
        <div class="clock" style="background:var(--lav)"><b data-clock="local">--:--</b><span data-local-name style="color:#fff">Tu hora</span></div>
      </div>
    </div>
    <div class="tz-tool">
      <div class="field"><label for="tz">Vivo en</label><select id="tz" data-tz-select>{"".join(f'<option value="{v}">{t}</option>' for v,t in opts)}</select></div>
      <div data-tz-rows></div>
      <p class="tz-note" data-tz-note></p>
    </div>
  </div>
</section>

<section class="wrap" style="padding-bottom:clamp(64px,9vw,110px)">
  <div class="navy-panel round" style="padding-inline:clamp(22px,5vw,64px)">
    <div class="center"><span class="eyebrow">Cómo funciona a distancia</span><h2 class="h2">Todo listo para que solo te preocupes por hablar.</h2></div>
    <ol class="path three">
      <li><span class="dot">1</span><h3 style="color:#fff">Coordinamos el horario</h3><p style="color:var(--on-dark-soft)">Te proponemos horas en tu zona horaria, no en la nuestra.</p></li>
      <li><span class="dot">2</span><h3 style="color:#fff">Recibes la invitación</h3><p style="color:var(--on-dark-soft)">Un evento de calendario con el link de Google Meet llega a tu correo.</p></li>
      <li><span class="dot">3</span><h3 style="color:#fff">Pagas desde donde estés</h3><p style="color:var(--on-dark-soft)">Opciones de pago internacional, en dólares o euros.</p></li>
    </ol>
  </div>
</section>
''' + contact() + '</main>\n' + footer()
open(OUT+'exterior.html','w').write(ext)
print('ok')
