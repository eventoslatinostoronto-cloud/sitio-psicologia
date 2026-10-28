/* Portal de terapeutas · Eucalipto Psicología
   Datos: se guardan en este navegador (localStorage). Ver README para pasar a una base de datos.
   Google Calendar: OAuth en el navegador con Google Identity Services + API REST de Calendar. */
(() => {
  "use strict";

  /* ---------------- Utilidades ---------------- */
  const STORE = "eucalipto.admin.v1";
  const REQ = "eucalipto.requests";
  const AUTH = "eucalipto.auth";
  const GTOKEN = "eucalipto.gtoken";
  const BOGOTA = "America/Bogota";
  const START_H = 7, END_H = 21, HOUR_PX = 52;
  const DAY = 864e5;

  const store = {
    get(k, d, s = localStorage) { try { const v = s.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v, s = localStorage) { try { s.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } },
    del(k, s = localStorage) { try { s.removeItem(k); } catch { /* */ } }
  };
  const ses = { get: (k, d) => store.get(k, d, sessionStorage), set: (k, v) => store.set(k, v, sessionStorage), del: k => store.del(k, sessionStorage) };

  const uid = () => Math.random().toString(36).slice(2, 10);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const browserTz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return BOGOTA; } })();

  const fmt = (d, o) => { try { return new Intl.DateTimeFormat("es-CO", o).format(new Date(d)); } catch { return ""; } };
  const fTime = (d, tz) => fmt(d, { hour: "2-digit", minute: "2-digit", hour12: false, ...(tz ? { timeZone: tz } : {}) });
  const fDay = d => fmt(d, { weekday: "long", day: "numeric", month: "long" });
  const fShort = d => fmt(d, { weekday: "short", day: "numeric", month: "short" });
  const fDate = d => fmt(d, { day: "numeric", month: "short", year: "numeric" });
  const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
  const startOfDay = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const startOfWeek = d => { const x = startOfDay(d); const dow = (x.getDay() + 6) % 7; return addDays(x, -dow); };
  const sameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();
  const pad = n => String(n).padStart(2, "0");
  const inDate = d => { const x = new Date(d); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`; };
  const inTime = d => { const x = new Date(d); return `${pad(x.getHours())}:${pad(x.getMinutes())}`; };
  const relDays = d => {
    const n = Math.round((startOfDay(d) - startOfDay(new Date())) / DAY);
    if (n === 0) return "hoy"; if (n === 1) return "mañana"; if (n === -1) return "ayer";
    return n > 0 ? `en ${n} días` : `hace ${-n} días`;
  };
  const initials = name => name.replace(/[&(].*$/, "").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const money = (v, cur) => { try { return new Intl.NumberFormat("es-CO", { style: "currency", currency: cur || "COP", maximumFractionDigits: 0 }).format(v || 0); } catch { return `${v} ${cur}`; } };

  const COUNTRIES = [
    ["Colombia", BOGOTA], ["España", "Europe/Madrid"], ["Estados Unidos (Este)", "America/New_York"], ["Estados Unidos (Centro)", "America/Chicago"],
    ["Estados Unidos (Pacífico)", "America/Los_Angeles"], ["Canadá (Toronto)", "America/Toronto"], ["Canadá (Vancouver)", "America/Vancouver"],
    ["México", "America/Mexico_City"], ["Chile", "America/Santiago"], ["Argentina", "America/Argentina/Buenos_Aires"], ["Perú", "America/Lima"],
    ["Ecuador", "America/Guayaquil"], ["Panamá", "America/Panama"], ["Reino Unido", "Europe/London"], ["Alemania", "Europe/Berlin"], ["Francia", "Europe/Paris"],
    ["Italia", "Europe/Rome"], ["Países Bajos", "Europe/Amsterdam"], ["Suiza", "Europe/Zurich"], ["Australia (Sídney)", "Australia/Sydney"]
  ];
  const tzOf = country => (COUNTRIES.find(c => c[0] === country) || [0, BOGOTA])[1];
  const cityOfTz = tz => (tz.split("/").pop() || "").replace(/_/g, " ");
  const FREQ = { semanal: 7, quincenal: 14, mensual: 28, puntual: 0 };
  const FREQ_LABEL = { semanal: "Semanal", quincenal: "Cada 15 días", mensual: "Mensual", puntual: "Sin frecuencia fija" };
  const THERAPY = { individual: "Individual", pareja: "Pareja", familia: "Familia" };
  const S_STATUS = { programada: ["Programada", "info"], realizada: ["Realizada", "ok"], cancelada: ["Cancelada", "bad"], no_asistio: ["No asistió", "warn"] };
  const C_STATUS = { activo: ["Activo", "ok"], pausa: ["En pausa", "warn"], alta: ["Alta", ""] };

  /* ---------------- Datos ---------------- */
  function seed() {
    const therapists = [
      { id: "t1", name: "Mariana Ortiz", short: "Mariana", color: "#9384d6" },
      { id: "t2", name: "Esteban Martínez", short: "Esteban", color: "#26304f" }
    ];
    const today = startOfDay(new Date());
    const ago = n => inDate(addDays(today, -n));
    const C = (o) => ({ id: uid(), createdAt: new Date().toISOString(), email: "", phone: "", notes: "", ...o });
    const clients = [
      C({ name: "Valentina Gómez", email: "valentina@ejemplo.com", phone: "+34 600 000 000", country: "España", city: "Madrid", modality: "online", therapy: "individual", therapistId: "t1", frequency: "semanal", fee: 55, currency: "EUR", status: "activo", startDate: ago(84), reason: "Duelo migratorio y ansiedad tras dos años en Madrid.", notes: "Prefiere sesiones al final de su tarde.", slot: [2, 13] }),
      C({ name: "Camilo y Laura Herrera", email: "camilo@ejemplo.com", phone: "+57 310 000 0000", country: "Colombia", city: "Bogotá", modality: "presencial", therapy: "pareja", therapistId: "ambos", frequency: "quincenal", fee: 260000, currency: "COP", status: "activo", startDate: ago(70), reason: "Comunicación y acuerdos tras el nacimiento de su hija.", slot: [4, 18] }),
      C({ name: "Andrés Felipe Ruiz", email: "andres@ejemplo.com", phone: "+1 416 000 0000", country: "Canadá (Toronto)", city: "Toronto", modality: "online", therapy: "individual", therapistId: "t2", frequency: "semanal", fee: 60, currency: "USD", status: "activo", startDate: ago(49), reason: "Adaptación laboral y soledad.", slot: [1, 19] }),
      C({ name: "Juliana Martínez", email: "juliana@ejemplo.com", phone: "+57 300 111 1111", country: "Colombia", city: "Medellín", modality: "online", therapy: "individual", therapistId: "t1", frequency: "quincenal", fee: 180000, currency: "COP", status: "activo", startDate: ago(60), reason: "Autoestima y límites en el trabajo.", slot: [3, 8] }),
      C({ name: "Sofía y Mateo Vargas", email: "sofia@ejemplo.com", phone: "+1 305 000 0000", country: "Estados Unidos (Este)", city: "Miami", modality: "online", therapy: "pareja", therapistId: "ambos", frequency: "semanal", fee: 80, currency: "USD", status: "activo", startDate: ago(35), reason: "Pareja migrante: él llegó primero, ella hace un año.", slot: [5, 17] }),
      C({ name: "Natalia Cárdenas", email: "natalia@ejemplo.com", phone: "+56 9 0000 0000", country: "Chile", city: "Santiago", modality: "online", therapy: "individual", therapistId: "t1", frequency: "mensual", fee: 55, currency: "USD", status: "activo", startDate: ago(120), reason: "Seguimiento después de proceso de duelo.", slot: [6, 9], noFuture: true }),
      C({ name: "Ricardo Páez", email: "ricardo@ejemplo.com", phone: "+57 320 000 0000", country: "Colombia", city: "Bogotá", modality: "presencial", therapy: "individual", therapistId: "t2", frequency: "semanal", fee: 180000, currency: "COP", status: "pausa", startDate: ago(150), reason: "Estrés laboral. Pausa por viaje de trabajo.", slot: [2, 7] }),
      C({ name: "Familia Ospina", email: "ospina@ejemplo.com", phone: "+57 315 000 0000", country: "Colombia", city: "Cali", modality: "online", therapy: "familia", therapistId: "t2", frequency: "mensual", fee: 220000, currency: "COP", status: "activo", startDate: ago(90), reason: "Convivencia con hijo adolescente.", slot: [3, 16] })
    ];
    clients.forEach(c => { c.tz = tzOf(c.country); c.location = c.country === "Colombia" ? "colombia" : "exterior"; });

    const sessions = [];
    const now = Date.now();
    clients.forEach((c, ci) => {
      const step = FREQ[c.frequency] || 7;
      const [dow, h] = c.slot;
      let anchor = addDays(startOfWeek(today), dow - 1); anchor.setHours(h, 0, 0, 0);
      const first = new Date(c.startDate).getTime();
      for (let k = -12; k <= 5; k++) {
        const d = addDays(anchor, k * step);
        const t = d.getTime();
        if (t < first || t < now - 75 * DAY || t > now + 32 * DAY) continue;
        if (c.status !== "activo" && t > now - 20 * DAY) continue;
        if (c.noFuture && t > now) continue;
        const past = t + 50 * 6e4 < now;
        let status = past ? "realizada" : "programada";
        if (past && (k + ci) % 7 === 0) status = "cancelada";
        if (past && (k + ci) % 11 === 0) status = "no_asistio";
        sessions.push({
          id: uid(), clientId: c.id, therapistId: c.therapistId, start: d.toISOString(), duration: c.therapy === "individual" ? 50 : 75,
          modality: c.modality, status, paid: past ? !(status === "realizada" && k >= -1 && ci % 2 === 0) : false,
          notes: past && status === "realizada" ? sampleNote(c, k) : "", meetLink: "", gEventId: ""
        });
      }
      delete c.slot; delete c.noFuture;
    });

    if (!store.get(REQ, []).length) {
      store.set(REQ, [
        { id: "r" + uid(), demo: true, createdAt: new Date(now - 3 * 36e5).toISOString(), status: "nueva", name: "Daniela Pérez", email: "daniela@ejemplo.com", phone: "+49 151 0000000", country: "Alemania", modality: "Online", therapy: "Individual", preference: "Mariana", message: "Llevo un año en Berlín y me está costando mucho. Me sirven las tardes.", timezone: "Europe/Berlin" },
        { id: "r" + uid(), demo: true, createdAt: new Date(now - 26 * 36e5).toISOString(), status: "nueva", name: "Jorge y Carolina", email: "jorge@ejemplo.com", phone: "+57 301 000 0000", country: "Colombia", modality: "Presencial", therapy: "Pareja", preference: "Los dos (pareja)", message: "Queremos terapia de pareja con los dos si es posible.", timezone: BOGOTA }
      ]);
    }
    return {
      version: 1, demo: true, therapists, clients, sessions,
      settings: { pin: "1234", googleClientId: "", calendarId: "primary", duration: 50, invite: true, address: "Consultorio en Chapinero, Bogotá" }
    };
  }
  function sampleNote(c, k) {
    const notes = {
      individual: ["Trabajamos registro de pensamientos. Tarea: diario de emociones 3 veces por semana.", "Se habló de la red de apoyo. Identifica dos personas cercanas.", "Avance en manejo de ansiedad antes de reuniones. Practicar respiración 4-7-8.", "Sesión centrada en la relación con su madre. Retomar la próxima vez."],
      pareja: ["Acuerdos sobre tareas de la casa. Revisar en dos semanas.", "Ejercicio de escucha activa. Ambos con buena disposición.", "Tema pendiente: visitas a la familia en diciembre."],
      familia: ["Se acordaron horarios de pantalla. Buena participación del hijo.", "Trabajamos comunicación sin gritos. Tarea: reunión familiar semanal."]
    }[c.therapy];
    return notes[Math.abs(k) % notes.length];
  }

  let state = store.get(STORE, null) || seed();
  // Colores anteriores (paleta café) → paleta lila/azul
  state.therapists.forEach(t => { if (t.color === "#b5897a") t.color = "#9384d6"; if (t.color === "#6f5248") t.color = "#26304f"; if (t.name === "Daniel Restrepo") { t.name = "Esteban Martínez"; t.short = "Esteban"; } });
  const save = () => store.set(STORE, state);
  save();
  const getReqs = () => store.get(REQ, []);
  const setReqs = list => store.set(REQ, list);

  const client = id => state.clients.find(c => c.id === id);
  const therapist = id => state.therapists.find(t => t.id === id);
  const thName = id => id === "ambos" ? "Los dos" : (therapist(id)?.short || "—");
  const thColor = id => id === "ambos" ? "#c07fae" : (therapist(id)?.color || "#9384d6");
  const sessionsOf = cid => state.sessions.filter(s => s.clientId === cid).sort((a, b) => new Date(a.start) - new Date(b.start));
  const nextOf = cid => sessionsOf(cid).find(s => s.status === "programada" && new Date(s.start) > Date.now());
  const lastOf = cid => sessionsOf(cid).filter(s => s.status === "realizada").pop();

  /* ---------------- UI base ---------------- */
  let view = "inicio", param = null, weekStart = startOfWeek(new Date()), filters = { q: "", loc: "todos", st: "activo", th: "todos", agendaTh: "todos", reqAll: false };
  let gWeekCache = {};

  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 3800);
  }
  function openModal(title, html, onMount) {
    $("#modal-title").textContent = title;
    $("#modal-body").innerHTML = html;
    $("#modal").hidden = false;
    onMount && onMount($("#modal-body"));
    const f = $("#modal-body input, #modal-body select, #modal-body textarea"); f && f.focus();
  }
  const closeModal = () => { $("#modal").hidden = true; $("#modal-body").innerHTML = ""; };
  $("#modal").addEventListener("click", e => { if (e.target.id === "modal" || e.target.closest("[data-close]")) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#modal").hidden) closeModal(); });

  /* Confirmación dentro de la página (el visor no permite confirm()) */
  function confirmStep(btn, label, action) {
    if (btn.dataset.armed) { action(); return; }
    btn.dataset.armed = "1"; const old = btn.textContent; btn.textContent = label;
    setTimeout(() => { if (btn.isConnected) { delete btn.dataset.armed; btn.textContent = old; } }, 4000);
  }

  /* ---------------- Login ---------------- */
  function showLogin() {
    $("#app").hidden = true; $("#login").hidden = false;
    $("#who-pick").innerHTML = state.therapists.map((t, i) => `
      <input type="radio" name="who" id="who-${t.id}" value="${t.id}" ${i === 0 ? "checked" : ""}>
      <label for="who-${t.id}"><span class="avatar" style="background:${t.color}">${esc(initials(t.name))}</span>${esc(t.short)}</label>`).join("");
  }
  $("#login-form").addEventListener("submit", e => {
    e.preventDefault();
    if ($("#pin").value !== String(state.settings.pin)) { $("#login-error").hidden = false; return; }
    ses.set(AUTH, $("input[name=who]:checked").value);
    $("#pin").value = ""; $("#login-error").hidden = true;
    boot();
  });
  $("#logout").addEventListener("click", () => { ses.del(AUTH); showLogin(); });

  function boot() {
    const me = therapist(ses.get(AUTH, null));
    if (!me) return showLogin();
    $("#login").hidden = true; $("#app").hidden = false;
    $("#me").innerHTML = `<i style="background:${me.color}">${esc(initials(me.name))}</i><span>${esc(me.name)}<small>Psicólogo/a</small></span>`;
    route();
  }

  /* ---------------- Router ---------------- */
  const TITLES = { inicio: "Inicio", agenda: "Agenda", clientes: "Clientes", solicitudes: "Solicitudes", ajustes: "Ajustes" };
  function route() {
    const h = location.hash.replace("#", "");
    if (TITLES[h] && h !== view) { view = h; param = null; }
    render();
  }
  window.addEventListener("hashchange", route);
  function go(v, p = null) { view = v; param = p; if (location.hash !== "#" + v) history.replaceState(null, "", "#" + v); render(); window.scrollTo(0, 0); }

  function render() {
    $$(".side-nav a").forEach(a => a.classList.toggle("active", a.dataset.view === view));
    const newReqs = getReqs().filter(r => r.status === "nueva").length;
    $("#req-badge").hidden = !newReqs; $("#req-badge").textContent = newReqs;
    $("#demo-banner").hidden = !state.demo;
    renderGPill();
    const me = therapist(ses.get(AUTH, null));
    const hr = new Date().getHours();
    $("#crumb").textContent = view === "inicio" ? `${hr < 12 ? "Buenos días" : hr < 19 ? "Buenas tardes" : "Buenas noches"}, ${me?.short || ""}` : cap(fDay(new Date()));
    $("#view-title").textContent = view === "clientes" && param ? (client(param)?.name || "Cliente") : TITLES[view];
    const v = $("#view");
    if (view === "inicio") v.innerHTML = vHome();
    else if (view === "agenda") { v.innerHTML = vAgenda(); afterAgenda(); }
    else if (view === "clientes") v.innerHTML = param ? vClient(param) : vClients();
    else if (view === "solicitudes") v.innerHTML = vRequests();
    else if (view === "ajustes") v.innerHTML = vSettings();
  }

  /* ---------------- Componentes ---------------- */
  const pill = (txt, cls = "") => `<span class="pill ${cls}">${esc(txt)}</span>`;
  const thPill = id => `<span class="pill dot" style="--c:${thColor(id)}">${esc(thName(id))}</span>`;
  const localHint = (date, c) => c && c.tz && c.tz !== browserTz ? `${fTime(date, c.tz)} en ${esc(c.city || cityOfTz(c.tz))}` : "";
  const ICON = {
    video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="13" height="12" rx="3"/><path d="m16 10 5-3v10l-5-3"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>'
  };
  function sessionRow(s, opts = {}) {
    const c = client(s.clientId); if (!c) return "";
    const d = new Date(s.start);
    const hint = localHint(d, c);
    const join = s.meetLink
      ? `<a class="sbtn meet" href="${esc(s.meetLink)}" target="_blank" rel="noopener">${ICON.video}Unirse</a>`
      : s.modality === "online" && s.status === "programada" ? `<button class="sbtn" data-act="meet" data-id="${s.id}">${ICON.video}Crear Meet</button>` : "";
    return `<div class="srow">
      <div class="time">${fTime(d)}<small>${opts.showDay ? esc(fShort(d)) : s.duration + " min"}</small></div>
      <div class="who"><b>${esc(c.name)}</b><span>${THERAPY[c.therapy]} · ${s.modality === "online" ? "Online" : "Presencial"}${hint ? " · " + hint : ""}</span>
        <div style="display:flex;gap:.3rem;margin-top:.35rem;flex-wrap:wrap">${thPill(s.therapistId)}${s.status !== "programada" ? pill(...S_STATUS[s.status]) : ""}</div></div>
      <div class="acts">${join}<button class="sbtn" data-act="session" data-id="${s.id}">Ver</button></div>
    </div>`;
  }

  /* ---------------- Inicio ---------------- */
  function vHome() {
    const now = new Date(), today = startOfDay(now), wk = startOfWeek(now), wkEnd = addDays(wk, 7);
    const active = state.sessions.filter(s => s.status !== "cancelada");
    const todayS = active.filter(s => sameDay(s.start, now)).sort((a, b) => new Date(a.start) - new Date(b.start));
    const weekS = active.filter(s => new Date(s.start) >= wk && new Date(s.start) < wkEnd);
    const upcoming = state.sessions.filter(s => s.status === "programada" && new Date(s.start) >= addDays(today, 1)).sort((a, b) => new Date(a.start) - new Date(b.start)).slice(0, 6);
    const unpaid = state.sessions.filter(s => s.status === "realizada" && !s.paid);
    const actives = state.clients.filter(c => c.status === "activo");
    const toSchedule = actives.filter(c => c.frequency !== "puntual" && !nextOf(c.id));
    const reqs = getReqs().filter(r => r.status === "nueva");

    return `
    <div class="kpis">
      <div class="kpi dark"><b>${todayS.length}</b><span>Sesiones hoy</span></div>
      <div class="kpi"><b>${weekS.length}</b><span>Sesiones esta semana</span></div>
      <div class="kpi"><b>${actives.length}</b><span>Clientes activos</span></div>
      <div class="kpi"><b>${unpaid.length}</b><span>Sesiones sin pago registrado</span></div>
    </div>
    <div class="cols">
      <div class="grid">
        <section class="card">
          <div class="card-h"><h2>Hoy · ${esc(fDay(now))}</h2><a class="sbtn" href="#agenda">Ver agenda</a></div>
          <div>${todayS.length ? todayS.map(s => sessionRow(s)).join("") : `<p class="empty">No hay sesiones hoy.</p>`}</div>
        </section>
        <section class="card">
          <div class="card-h"><h2>Próximas sesiones</h2></div>
          <div>${upcoming.length ? upcoming.map(s => sessionRow(s, { showDay: true })).join("") : `<p class="empty">No hay sesiones programadas.</p>`}</div>
        </section>
      </div>
      <div class="grid">
        <section class="card">
          <div class="card-h"><h2>Por agendar</h2>${pill(toSchedule.length + " clientes", toSchedule.length ? "warn" : "ok")}</div>
          <p class="hint">Clientes activos sin próxima cita, según su frecuencia.</p>
          <div>${toSchedule.length ? toSchedule.map(c => {
            const l = lastOf(c.id);
            const due = l ? addDays(l.start, FREQ[c.frequency]) : null;
            return `<div class="alert"><div><b>${esc(c.name)}</b><span>${FREQ_LABEL[c.frequency]} · última ${l ? relDays(l.start) : "—"}${due ? ` · tocaba ${relDays(due)}` : ""}</span></div>
              <button class="sbtn" data-act="new-session" data-client="${c.id}">Agendar</button></div>`;
          }).join("") : `<p class="empty">Todos tienen su próxima cita.</p>`}</div>
        </section>
        <section class="card">
          <div class="card-h"><h2>Solicitudes nuevas</h2><a class="sbtn" href="#solicitudes">Ver todas</a></div>
          <div>${reqs.length ? reqs.slice(0, 3).map(r => `<div class="alert"><div><b>${esc(r.name)}</b><span>${esc(r.country)} · ${esc(r.therapy)} · ${esc(r.modality)}</span></div>${pill(relDays(r.createdAt))}</div>`).join("") : `<p class="empty">No hay solicitudes nuevas.</p>`}</div>
        </section>
        <section class="card">
          <div class="card-h"><h2>Pagos pendientes</h2></div>
          <div>${unpaid.length ? unpaid.slice(-5).reverse().map(s => { const c = client(s.clientId); return `<div class="alert"><div><b>${esc(c?.name)}</b><span>${esc(fShort(s.start))} · ${money(c?.fee, c?.currency)}</span></div><button class="sbtn" data-act="paid" data-id="${s.id}">Marcar pagada</button></div>`; }).join("") : `<p class="empty">Todo al día.</p>`}</div>
        </section>
      </div>
    </div>`;
  }

  /* ---------------- Agenda ---------------- */
  function vAgenda() {
    const days = [...Array(7)].map((_, i) => addDays(weekStart, i));
    const end = addDays(weekStart, 7);
    const list = state.sessions.filter(s => { const d = new Date(s.start); return d >= weekStart && d < end && (filters.agendaTh === "todos" || s.therapistId === filters.agendaTh || s.therapistId === "ambos"); });
    const gEvents = gWeekCache[weekStart.toISOString()] || [];
    const hours = [...Array(END_H - START_H)].map((_, i) => `<div>${pad(START_H + i)}:00</div>`).join("");
    const block = (startD, mins) => {
      const top = Math.max(0, (startD.getHours() + startD.getMinutes() / 60 - START_H) * HOUR_PX);
      return `top:${top}px;height:${Math.max(22, mins / 60 * HOUR_PX - 3)}px`;
    };
    const cols = days.map(d => {
      const evs = list.filter(s => sameDay(s.start, d)).map(s => {
        const c = client(s.clientId); const sd = new Date(s.start);
        const cls = s.status === "realizada" ? "done" : s.status === "cancelada" || s.status === "no_asistio" ? "cancel" : "";
        return `<button class="ev ${cls}" style="${block(sd, s.duration)};--c:${thColor(s.therapistId)}" data-act="session" data-id="${s.id}">
          <b>${esc(c?.name || "—")}</b>${fTime(sd)} · ${s.modality === "online" ? "Online" : "Presencial"}</button>`;
      }).join("");
      const gs = gEvents.filter(e => sameDay(e.start, d)).map(e => `<div class="ev google" style="${block(new Date(e.start), (new Date(e.end) - new Date(e.start)) / 6e4)}" title="${esc(e.summary)}"><b>${esc(e.summary || "Ocupado")}</b>Google Calendar</div>`).join("");
      let now = "";
      if (sameDay(d, new Date())) { const n = new Date(); const h = n.getHours() + n.getMinutes() / 60; if (h >= START_H && h <= END_H) now = `<div class="now-line" style="top:${(h - START_H) * HOUR_PX}px"></div>`; }
      return `<div class="day" data-day="${inDate(d)}" style="height:${(END_H - START_H) * HOUR_PX}px">${gs}${evs}${now}</div>`;
    }).join("");
    const heads = days.map(d => `<div class="hd ${sameDay(d, new Date()) ? "today" : ""}">${esc(fmt(d, { weekday: "short" }))}<b>${d.getDate()}</b></div>`).join("");
    return `
    <div class="toolbar">
      <div class="seg"><button data-act="wk" data-n="-1" aria-label="Semana anterior">‹</button><button data-act="wk" data-n="0">Hoy</button><button data-act="wk" data-n="1" aria-label="Semana siguiente">›</button></div>
      <strong>${esc(fmt(weekStart, { day: "numeric", month: "short" }))} – ${esc(fmt(addDays(weekStart, 6), { day: "numeric", month: "short", year: "numeric" }))}</strong>
      <span class="spacer"></span>
      <select id="agenda-th" aria-label="Filtrar por terapeuta"><option value="todos">Ambos terapeutas</option>${state.therapists.map(t => `<option value="${t.id}" ${filters.agendaTh === t.id ? "selected" : ""}>${esc(t.short)}</option>`).join("")}</select>
      ${gConnected() ? `<button class="sbtn" data-act="gsync">Actualizar Google</button>` : ""}
    </div>
    <div class="cal-wrap"><div class="cal" style="--hh:${HOUR_PX}px">
      <div class="hd"></div>${heads}
      <div class="hours">${hours}</div>${cols}
    </div></div>
    <div class="legend">
      ${state.therapists.map(t => `<span style="--c:${t.color}"><i></i>${esc(t.short)}</span>`).join("")}
      <span style="--c:${thColor("ambos")}"><i></i>Los dos</span>
      <span><i style="--c:var(--surface-2);box-shadow:inset 0 0 0 1px var(--line)"></i>Otros eventos de Google</span>
      <span class="hint">Haz clic en un espacio libre para agendar.</span>
    </div>`;
  }
  function afterAgenda() {
    const sel = $("#agenda-th");
    sel && sel.addEventListener("change", () => { filters.agendaTh = sel.value; render(); });
    $$(".cal .day").forEach(col => col.addEventListener("click", e => {
      if (e.target.closest(".ev")) return;
      const y = e.clientY - col.getBoundingClientRect().top;
      const mins = Math.round((y / HOUR_PX) * 2) * 30;
      const d = new Date(col.dataset.day + "T00:00"); d.setHours(START_H, mins, 0, 0);
      sessionForm(null, { start: d });
    }));
    const key = weekStart.toISOString();
    if (gConnected() && !gWeekCache[key]) gLoadWeek(weekStart).then(() => view === "agenda" && render()).catch(err => toast(err.message));
  }

  /* ---------------- Clientes ---------------- */
  function vClients() {
    const q = filters.q.toLowerCase();
    const rows = state.clients.filter(c =>
      (filters.loc === "todos" || c.location === filters.loc) &&
      (filters.st === "todos" || c.status === filters.st) &&
      (filters.th === "todos" || c.therapistId === filters.th || c.therapistId === "ambos") &&
      (!q || [c.name, c.email, c.city, c.country, c.phone].join(" ").toLowerCase().includes(q))
    ).sort((a, b) => a.name.localeCompare(b.name, "es"));
    return `
    <div class="toolbar">
      <input type="search" id="c-q" placeholder="Buscar por nombre, correo, ciudad…" value="${esc(filters.q)}" aria-label="Buscar clientes">
      <select id="c-loc" aria-label="Ubicación"><option value="todos">Colombia y exterior</option><option value="colombia" ${filters.loc === "colombia" ? "selected" : ""}>En Colombia</option><option value="exterior" ${filters.loc === "exterior" ? "selected" : ""}>En el exterior</option></select>
      <select id="c-st" aria-label="Estado">${[["activo", "Activos"], ["pausa", "En pausa"], ["alta", "De alta"], ["todos", "Todos los estados"]].map(([v, l]) => `<option value="${v}" ${filters.st === v ? "selected" : ""}>${l}</option>`).join("")}</select>
      <select id="c-th" aria-label="Terapeuta"><option value="todos">Ambos terapeutas</option>${state.therapists.map(t => `<option value="${t.id}" ${filters.th === t.id ? "selected" : ""}>${esc(t.short)}</option>`).join("")}</select>
      <button class="btn btn-dark" data-act="new-client" style="padding:.65rem 1rem;font-size:.9rem">${ICON.plus}Nuevo cliente</button>
    </div>
    <div class="table-wrap"><table class="t">
      <thead><tr><th>Cliente</th><th>Dónde</th><th>Terapia</th><th>Terapeuta</th><th>Frecuencia</th><th>Última</th><th>Próxima</th><th>Estado</th></tr></thead>
      <tbody>${rows.length ? rows.map(c => {
        const n = nextOf(c.id), l = lastOf(c.id);
        return `<tr data-act="open-client" data-id="${c.id}">
          <td><div class="namecell"><span class="avatar" style="background:${thColor(c.therapistId)}">${esc(initials(c.name))}</span><span class="name"><b>${esc(c.name)}</b><span>${esc(c.email)}</span></span></div></td>
          <td>${esc(c.city)}${c.location === "exterior" ? `<br><span class="hint">${esc(c.country)} · ${fTime(new Date(), c.tz)} allá</span>` : ""}</td>
          <td>${THERAPY[c.therapy]}<br><span class="hint">${c.modality === "online" ? "Online" : c.modality === "presencial" ? "Presencial" : "Mixta"}</span></td>
          <td>${thPill(c.therapistId)}</td>
          <td>${FREQ_LABEL[c.frequency]}</td>
          <td class="num">${l ? esc(relDays(l.start)) : "—"}</td>
          <td class="num">${n ? esc(fShort(n.start)) + " " + fTime(n.start) : c.status === "activo" ? pill("Sin agendar", "warn") : "—"}</td>
          <td>${pill(...C_STATUS[c.status])}</td></tr>`;
      }).join("") : `<tr><td colspan="8" class="empty" style="text-align:center">No hay clientes con estos filtros.</td></tr>`}</tbody>
    </table></div>`;
  }

  function vClient(id) {
    const c = client(id); if (!c) { param = null; return vClients(); }
    const all = sessionsOf(id);
    const done = all.filter(s => s.status === "realizada");
    const missed = all.filter(s => s.status === "cancelada" || s.status === "no_asistio");
    const unpaid = done.filter(s => !s.paid);
    const n = nextOf(id), l = lastOf(id);
    const gaps = done.slice(1).map((s, i) => (new Date(s.start) - new Date(done[i].start)) / DAY);
    const avg = gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : null;
    return `
    <div class="toolbar"><button class="sbtn" data-act="back">← Todos los clientes</button></div>
    <div class="detail">
      <section class="card profile">
        <span class="avatar" style="background:${thColor(c.therapistId)}">${esc(initials(c.name))}</span>
        <div><h2>${esc(c.name)}</h2><div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-top:.5rem">${pill(...C_STATUS[c.status])}${thPill(c.therapistId)}${pill(c.location === "exterior" ? "Exterior" : "Colombia", "info")}</div></div>
        <div class="rhythm">
          <span class="hint">Ritmo de sesiones</span>
          <b>${FREQ_LABEL[c.frequency]}${avg ? ` · en promedio cada ${avg} días` : ""}</b>
          <span>Última: ${l ? `${esc(fShort(l.start))} (${relDays(l.start)})` : "—"}</span>
          <span>Próxima: ${n ? `${esc(fShort(n.start))}, ${fTime(n.start)}${localHint(n.start, c) ? " · " + localHint(n.start, c) : ""}` : "sin agendar"}</span>
        </div>
        <dl class="kv">
          <dt>Correo</dt><dd>${esc(c.email) || "—"}</dd>
          <dt>Teléfono</dt><dd>${esc(c.phone) || "—"}</dd>
          <dt>Ubicación</dt><dd>${esc(c.city)}, ${esc(c.country)}</dd>
          <dt>Hora local</dt><dd>${fTime(new Date(), c.tz)} (${esc(cityOfTz(c.tz))})</dd>
          <dt>Terapia</dt><dd>${THERAPY[c.therapy]} · ${c.modality === "online" ? "Online" : c.modality === "presencial" ? "Presencial" : "Mixta"}</dd>
          <dt>Tarifa</dt><dd>${money(c.fee, c.currency)} por sesión</dd>
          <dt>Desde</dt><dd>${c.startDate ? esc(fDate(c.startDate + "T12:00")) : "—"}</dd>
        </dl>
        <div><span class="hint">Motivo de consulta</span><p class="note-box" style="margin-top:.4rem">${esc(c.reason) || "—"}</p></div>
        <div><span class="hint">Notas generales</span><p class="note-box" style="margin-top:.4rem">${esc(c.notes) || "—"}</p></div>
        <div class="form-actions" style="justify-content:flex-start">
          <button class="btn btn-clay" data-act="new-session" data-client="${c.id}" style="padding:.7rem 1rem;font-size:.9rem">Agendar sesión</button>
          <button class="btn btn-outline" data-act="edit-client" data-id="${c.id}" style="padding:.7rem 1rem;font-size:.9rem">Editar</button>
          ${c.phone ? `<a class="btn btn-outline" href="https://wa.me/${esc(c.phone.replace(/\D/g, ""))}" target="_blank" rel="noopener" style="padding:.7rem 1rem;font-size:.9rem">WhatsApp</a>` : ""}
        </div>
      </section>
      <div class="grid">
        <div class="kpis" style="grid-template-columns:repeat(3,1fr);margin:0">
          <div class="kpi"><b>${done.length}</b><span>Sesiones realizadas</span></div>
          <div class="kpi"><b>${missed.length}</b><span>Canceladas o sin asistir</span></div>
          <div class="kpi"><b>${unpaid.length}</b><span>Sin pago registrado</span></div>
        </div>
        <section class="card">
          <div class="card-h"><h2>Historial de sesiones</h2><span class="hint">${all.length} en total</span></div>
          <div class="timeline">${all.length ? all.slice().reverse().map(s => `
            <div class="tl">
              <div class="when">${esc(fShort(s.start))}<small>${fTime(s.start)} · ${s.duration} min</small></div>
              <div><div style="display:flex;gap:.3rem;flex-wrap:wrap;margin-bottom:.35rem">${pill(...S_STATUS[s.status])}${thPill(s.therapistId)}${s.status === "realizada" ? (s.paid ? pill("Pagada", "ok") : pill("Pago pendiente", "warn")) : ""}</div>
                <p>${esc(s.notes) || '<span class="hint">Sin notas</span>'}</p></div>
              <div class="acts" style="display:flex;gap:.4rem">${s.meetLink && s.status === "programada" ? `<a class="sbtn meet" href="${esc(s.meetLink)}" target="_blank" rel="noopener">${ICON.video}Meet</a>` : ""}<button class="sbtn" data-act="session" data-id="${s.id}">Abrir</button></div>
            </div>`).join("") : `<p class="empty">Aún no hay sesiones. Agenda la primera.</p>`}</div>
        </section>
      </div>
    </div>`;
  }

  function clientForm(id, prefill = {}) {
    const c = id ? client(id) : { name: "", email: "", phone: "", country: "Colombia", city: "", modality: "online", therapy: "individual", therapistId: ses.get(AUTH, "t1"), frequency: "semanal", fee: "", currency: "COP", status: "activo", startDate: inDate(new Date()), reason: "", notes: "", ...prefill };
    const opt = (o, v) => Object.entries(o).map(([k, l]) => `<option value="${k}" ${v === k ? "selected" : ""}>${l}</option>`).join("");
    openModal(id ? "Editar cliente" : "Nuevo cliente", `
      <form id="cform" class="grid">
        <div class="fgrid">
          <div class="field full"><label for="cf-name">Nombre</label><input id="cf-name" name="name" required value="${esc(c.name)}" placeholder="Nombre completo o de la pareja/familia"></div>
          <div class="field"><label for="cf-email">Correo</label><input id="cf-email" name="email" type="email" value="${esc(c.email)}"><span class="hint">Aquí llega la invitación con el link de Meet.</span></div>
          <div class="field"><label for="cf-phone">WhatsApp</label><input id="cf-phone" name="phone" value="${esc(c.phone)}"></div>
          <div class="field"><label for="cf-country">País</label><select id="cf-country" name="country">${COUNTRIES.map(([n]) => `<option ${c.country === n ? "selected" : ""}>${n}</option>`).join("")}</select></div>
          <div class="field"><label for="cf-city">Ciudad</label><input id="cf-city" name="city" value="${esc(c.city)}"></div>
          <div class="field"><label for="cf-therapy">Terapia</label><select id="cf-therapy" name="therapy">${opt(THERAPY, c.therapy)}</select></div>
          <div class="field"><label for="cf-mod">Modalidad</label><select id="cf-mod" name="modality">${opt({ online: "Online", presencial: "Presencial", mixta: "Mixta" }, c.modality)}</select></div>
          <div class="field"><label for="cf-th">Terapeuta</label><select id="cf-th" name="therapistId">${state.therapists.map(t => `<option value="${t.id}" ${c.therapistId === t.id ? "selected" : ""}>${esc(t.name)}</option>`).join("")}<option value="ambos" ${c.therapistId === "ambos" ? "selected" : ""}>Los dos (co-terapia)</option></select></div>
          <div class="field"><label for="cf-freq">Frecuencia</label><select id="cf-freq" name="frequency">${opt(FREQ_LABEL, c.frequency)}</select></div>
          <div class="field"><label for="cf-fee">Tarifa por sesión</label><input id="cf-fee" name="fee" type="number" min="0" step="any" value="${esc(c.fee)}"></div>
          <div class="field"><label for="cf-cur">Moneda</label><select id="cf-cur" name="currency">${["COP", "USD", "EUR", "CAD", "GBP"].map(x => `<option ${c.currency === x ? "selected" : ""}>${x}</option>`).join("")}</select></div>
          <div class="field"><label for="cf-status">Estado</label><select id="cf-status" name="status">${opt({ activo: "Activo", pausa: "En pausa", alta: "Alta" }, c.status)}</select></div>
          <div class="field"><label for="cf-start">Inicio del proceso</label><input id="cf-start" name="startDate" type="date" value="${esc(c.startDate)}"></div>
          <div class="field full"><label for="cf-reason">Motivo de consulta</label><textarea id="cf-reason" name="reason">${esc(c.reason)}</textarea></div>
          <div class="field full"><label for="cf-notes">Notas generales</label><textarea id="cf-notes" name="notes">${esc(c.notes)}</textarea></div>
        </div>
        <div class="form-actions">
          ${id ? `<button type="button" class="sbtn danger left" data-del-client>Eliminar cliente</button>` : ""}
          <button type="button" class="btn btn-outline" data-close>Cancelar</button>
          <button class="btn btn-dark" type="submit">Guardar</button>
        </div>
      </form>`, body => {
      const f = $("#cform", body);
      const cty = $("#cf-country", body);
      cty.addEventListener("change", () => { if (cty.value === "Colombia" && $("#cf-cur", body).value !== "COP") $("#cf-cur", body).value = "COP"; else if (cty.value !== "Colombia" && $("#cf-cur", body).value === "COP") $("#cf-cur", body).value = cty.value === "España" || /Alemania|Francia|Italia|Países|Suiza/.test(cty.value) ? "EUR" : "USD"; });
      f.addEventListener("submit", e => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(f).entries());
        if (!d.name.trim()) { $("#cf-name", body).focus(); return; }
        d.fee = Number(d.fee) || 0; d.tz = tzOf(d.country); d.location = d.country === "Colombia" ? "colombia" : "exterior";
        if (id) Object.assign(client(id), d);
        else { const nc = { id: uid(), createdAt: new Date().toISOString(), ...d }; state.clients.push(nc); id = nc.id; prefill.onCreate && prefill.onCreate(nc); }
        save(); closeModal(); toast("Cliente guardado"); go("clientes", id);
      });
      const del = $("[data-del-client]", body);
      del && del.addEventListener("click", () => confirmStep(del, "Toca otra vez para eliminar", () => {
        state.sessions = state.sessions.filter(s => s.clientId !== id);
        state.clients = state.clients.filter(x => x.id !== id);
        save(); closeModal(); toast("Cliente eliminado"); go("clientes");
      }));
    });
  }

  /* ---------------- Sesiones ---------------- */
  function sessionForm(id, pre = {}) {
    const s = id ? state.sessions.find(x => x.id === id) : null;
    const c0 = client(s?.clientId || pre.clientId);
    let start = s ? new Date(s.start) : pre.start || (() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d; })();
    const clientsSorted = state.clients.filter(c => c.status !== "alta" || c.id === c0?.id).sort((a, b) => a.name.localeCompare(b.name, "es"));
    if (!clientsSorted.length) { toast("Primero crea un cliente."); clientForm(null); return; }
    const canG = !!state.settings.googleClientId;
    openModal(s ? "Sesión" : "Nueva sesión", `
      <form id="sform" class="grid">
        <div class="fgrid">
          <div class="field full"><label for="sf-client">Cliente</label><select id="sf-client" name="clientId" ${s ? "disabled" : ""}>${clientsSorted.map(c => `<option value="${c.id}" ${c0?.id === c.id ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></div>
          <div class="field"><label for="sf-date">Fecha</label><input id="sf-date" name="date" type="date" required value="${inDate(start)}"></div>
          <div class="field"><label for="sf-time">Hora (tu hora)</label><input id="sf-time" name="time" type="time" step="900" required value="${inTime(start)}"></div>
          <div class="field"><label for="sf-dur">Duración</label><select id="sf-dur" name="duration">${[30, 45, 50, 60, 75, 90].map(m => `<option value="${m}" ${(s?.duration || state.settings.duration) == m ? "selected" : ""}>${m} min</option>`).join("")}</select></div>
          <div class="field"><label for="sf-mod">Modalidad</label><select id="sf-mod" name="modality"><option value="online">Online (Google Meet)</option><option value="presencial">Presencial</option></select></div>
          <div class="field full"><label for="sf-th">Terapeuta</label><select id="sf-th" name="therapistId">${state.therapists.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join("")}<option value="ambos">Los dos (co-terapia)</option></select></div>
          <p class="hint full" id="sf-local"></p>
          ${s ? `
          <div class="field"><label for="sf-status">Estado</label><select id="sf-status" name="status">${Object.entries(S_STATUS).map(([k, [l]]) => `<option value="${k}" ${s.status === k ? "selected" : ""}>${l}</option>`).join("")}</select></div>
          <label class="check" style="align-self:end;padding-bottom:.8rem"><input type="checkbox" name="paid" ${s.paid ? "checked" : ""}> Pago recibido</label>
          <div class="field full"><label for="sf-notes">Notas de la sesión</label><textarea id="sf-notes" name="notes" placeholder="Temas trabajados, tareas, observaciones…">${esc(s.notes)}</textarea></div>
          <div class="full" style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center">
            ${s.meetLink ? `<a class="sbtn meet" href="${esc(s.meetLink)}" target="_blank" rel="noopener">${ICON.video}Unirse a Meet</a><button type="button" class="sbtn" data-copy="${esc(s.meetLink)}">Copiar link</button>` : s.modality === "online" ? `<button type="button" class="sbtn" data-act="meet" data-id="${s.id}">${ICON.video}Crear link de Meet</button>` : ""}
            ${s.gLink ? `<a class="sbtn" href="${esc(s.gLink)}" target="_blank" rel="noopener">Ver en Google Calendar</a>` : ""}
            ${s.gEventId ? pill("Sincronizada con Google", "ok") : ""}
          </div>` : `
          <div class="field full"><label for="sf-repeat">Repetir</label><select id="sf-repeat" name="repeat"><option value="0">Solo esta sesión</option><option value="4">Según la frecuencia del cliente · 4 sesiones</option><option value="8">Según la frecuencia del cliente · 8 sesiones</option></select></div>
          <label class="check full"><input type="checkbox" name="google" ${canG ? "checked" : ""}> <span>Crear en Google Calendar${" "}con link de Meet si es online${canG ? "" : ` <span class="hint">· primero agrega tu Client ID en Ajustes</span>`}</span></label>
          <label class="check full"><input type="checkbox" name="invite" ${state.settings.invite ? "checked" : ""}> Enviar invitación al correo del cliente</label>`}
        </div>
        <div class="form-actions">
          ${s ? `<button type="button" class="sbtn danger left" data-del-session>Eliminar</button><button type="button" class="sbtn left" data-open-client="${s.clientId}">Ver cliente</button>` : ""}
          <button type="button" class="btn btn-outline" data-close>Cancelar</button>
          <button class="btn btn-dark" type="submit">${s ? "Guardar" : "Agendar"}</button>
        </div>
      </form>`, body => {
      const f = $("#sform", body);
      const selC = $("#sf-client", body), mod = $("#sf-mod", body), th = $("#sf-th", body);
      const syncClient = () => { const c = client(selC.value); if (!c) return; mod.value = s?.modality || (c.modality === "presencial" ? "presencial" : "online"); th.value = s?.therapistId || c.therapistId; if (!s) $("#sf-dur", body).value = c.therapy === "individual" ? state.settings.duration : 75; };
      const preview = () => {
        const c = client(selC.value); const d = new Date(`${$("#sf-date", body).value}T${$("#sf-time", body).value || "00:00"}`);
        const lh = localHint(d, c);
        $("#sf-local", body).textContent = isNaN(d) ? "" : lh ? `Para ${c.name.split(" ")[0]} serán las ${lh}.` : "";
      };
      syncClient(); preview();
      selC.addEventListener("change", () => { syncClient(); preview(); });
      ["#sf-date", "#sf-time"].forEach(sel => $(sel, body).addEventListener("input", preview));
      $$("[data-copy]", body).forEach(b => b.addEventListener("click", () => copy(b.dataset.copy, b)));
      const oc = $("[data-open-client]", body); oc && oc.addEventListener("click", () => { closeModal(); go("clientes", oc.dataset.openClient); });

      f.addEventListener("submit", async e => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(f).entries());
        const when = new Date(`${d.date}T${d.time}`);
        if (isNaN(when)) return toast("Revisa la fecha y la hora.");
        const btn = $("button[type=submit]", f); btn.disabled = true;
        try {
          if (s) {
            const moved = when.toISOString() !== new Date(s.start).toISOString() || Number(d.duration) !== s.duration;
            const wasCancelled = s.status !== "cancelada" && d.status === "cancelada";
            Object.assign(s, { start: when.toISOString(), duration: Number(d.duration), modality: d.modality, therapistId: d.therapistId, status: d.status, paid: !!d.paid, notes: d.notes });
            if (s.gEventId && wasCancelled) { await gDelete(s); toast("Sesión cancelada y quitada de Google Calendar"); }
            else if (s.gEventId && moved) { await gPatchTime(s); toast("Sesión movida. Google Calendar avisó al cliente."); }
            else toast("Sesión guardada");
          } else {
            const c = client(d.clientId);
            const n = Number(d.repeat) || 0, step = FREQ[c.frequency] || 7;
            const created = [];
            for (let i = 0; i < Math.max(1, n); i++) {
              created.push({ id: uid(), clientId: c.id, therapistId: d.therapistId, start: addDays(when, i * step).toISOString(), duration: Number(d.duration), modality: d.modality, status: "programada", paid: false, notes: "", meetLink: "", gEventId: "" });
            }
            state.sessions.push(...created); save();
            if (d.google) {
              let ok = 0;
              for (const x of created) { try { await gCreate(x, !!d.invite); ok++; } catch (err) { toast(err.message); break; } }
              if (ok) toast(ok === 1 ? (created[0].meetLink ? "Sesión agendada con link de Meet" : "Sesión agendada en Google Calendar") : `${ok} sesiones agendadas en Google Calendar`);
            } else toast(created.length === 1 ? "Sesión agendada" : `${created.length} sesiones agendadas`);
            if (c.status === "pausa") c.status = "activo";
          }
          save(); closeModal(); gWeekCache = {}; render();
        } catch (err) { save(); toast(err.message); btn.disabled = false; render(); }
      });
      const del = $("[data-del-session]", body);
      del && del.addEventListener("click", () => confirmStep(del, "Toca otra vez para eliminar", async () => {
        try { if (s.gEventId) await gDelete(s); } catch (err) { toast(err.message); }
        state.sessions = state.sessions.filter(x => x.id !== s.id); save(); closeModal(); toast("Sesión eliminada"); render();
      }));
    });
  }

  async function addMeet(id, btn) {
    const s = state.sessions.find(x => x.id === id); if (!s) return;
    if (!state.settings.googleClientId) { toast("Conecta Google Calendar en Ajustes para crear links de Meet."); go("ajustes"); return; }
    if (btn) { btn.disabled = true; btn.textContent = "Creando…"; }
    try {
      if (s.gEventId) await gAddConference(s); else await gCreate(s, state.settings.invite);
      save(); toast(s.meetLink ? "Link de Meet listo" : "Evento creado. Meet tardará unos segundos en aparecer.");
      if (!$("#modal").hidden && s.meetLink) sessionForm(s.id);
    } catch (err) { toast(err.message); }
    render();
  }

  function copy(text, btn) {
    const done = () => { if (btn) { const o = btn.textContent; btn.textContent = "Copiado"; setTimeout(() => btn.textContent = o, 1500); } };
    try { navigator.clipboard.writeText(text).then(done, () => fallback()); } catch { fallback(); }
    function fallback() { const i = document.createElement("input"); i.value = text; document.body.appendChild(i); i.select(); try { document.execCommand("copy"); done(); } catch { toast(text); } i.remove(); }
  }

  /* ---------------- Solicitudes ---------------- */
  function vRequests() {
    const all = getReqs();
    const list = filters.reqAll ? all : all.filter(r => r.status === "nueva");
    return `
    <div class="toolbar">
      <div class="seg"><button class="${filters.reqAll ? "" : "on"}" data-act="req-filter" data-v="0">Nuevas</button><button class="${filters.reqAll ? "on" : ""}" data-act="req-filter" data-v="1">Todas</button></div>
      <span class="hint">Llegan desde el formulario “Agenda tu cita” del sitio.</span>
    </div>
    <section class="card">
      ${list.length ? list.map(r => `
        <div class="req">
          <div>
            <b>${esc(r.name)}</b> <span class="hint">· ${esc(fShort(r.createdAt))}, ${fTime(r.createdAt)} (${relDays(r.createdAt)})</span>
            <div class="meta">${pill(r.country || "—", "info")}${pill(r.therapy || "—")}${pill(r.modality || "—")}${r.preference && r.preference !== "Sin preferencia" ? pill("Prefiere: " + r.preference) : ""}${r.status !== "nueva" ? pill(r.status === "convertida" ? "Ya es cliente" : "Archivada", r.status === "convertida" ? "ok" : "") : ""}${r.demo ? pill("Ejemplo") : ""}</div>
            ${r.message ? `<p>“${esc(r.message)}”</p>` : ""}
            <p class="hint">${esc(r.email)}${r.phone ? " · " + esc(r.phone) : ""}${r.timezone && r.timezone !== browserTz ? ` · allá son las ${fTime(new Date(), r.timezone)}` : ""}</p>
          </div>
          <div class="acts" style="display:flex;gap:.4rem;flex-wrap:wrap;align-content:start;justify-content:flex-end">
            ${r.status === "nueva" ? `<button class="sbtn meet" data-act="req-convert" data-id="${r.id}">Crear cliente</button>` : ""}
            ${r.phone ? `<a class="sbtn" href="https://wa.me/${esc(String(r.phone).replace(/\D/g, ""))}" target="_blank" rel="noopener">WhatsApp</a>` : ""}
            ${r.status === "nueva" ? `<button class="sbtn" data-act="req-archive" data-id="${r.id}">Archivar</button>` : ""}
          </div>
        </div>`).join("") : `<p class="empty">No hay solicitudes ${filters.reqAll ? "" : "nuevas"}. Cuando alguien llene el formulario del sitio, aparecerá aquí.</p>`}
    </section>`;
  }

  /* ---------------- Ajustes ---------------- */
  function vSettings() {
    const st = state.settings;
    return `
    <div class="settings">
      <section class="card">
        <div class="card-h"><h2>Google Calendar y Meet</h2>${gConnected() ? pill("Conectado", "ok") : pill("Sin conectar", "warn")}</div>
        <p class="hint">Al agendar, el portal crea el evento en su Google Calendar con un link de Google Meet y le envía la invitación al cliente.</p>
        <ol class="steps-mini">
          <li>Entra a <b>console.cloud.google.com</b>, crea un proyecto y activa la <b>Google Calendar API</b>.</li>
          <li>En “Pantalla de consentimiento OAuth” agrega sus correos como usuarios de prueba.</li>
          <li>En “Credenciales” crea un <b>ID de cliente OAuth</b> tipo “Aplicación web”.</li>
          <li>En “Orígenes de JavaScript autorizados” agrega: <code>${esc(location.origin)}</code></li>
          <li>Pega aquí el Client ID y toca “Conectar”.</li>
        </ol>
        <form id="gform" class="grid">
          <div class="field"><label for="g-id">Client ID de Google</label><input id="g-id" name="googleClientId" value="${esc(st.googleClientId)}" placeholder="123456-abc.apps.googleusercontent.com"></div>
          <div class="field"><label for="g-cal">Calendario</label><input id="g-cal" name="calendarId" value="${esc(st.calendarId)}"><span class="hint">“primary” es su calendario principal. Pueden usar el ID de un calendario compartido de consultorio.</span></div>
          <label class="check"><input type="checkbox" name="invite" ${st.invite ? "checked" : ""}> Enviar invitaciones a los clientes por defecto</label>
          <div class="form-actions" style="justify-content:flex-start">
            <button class="btn btn-dark" type="submit">Guardar y conectar</button>
            ${gConnected() ? `<button class="btn btn-outline" type="button" data-act="gdisconnect">Desconectar</button>` : ""}
          </div>
        </form>
      </section>
      <div class="grid">
        <section class="card">
          <div class="card-h"><h2>Terapeutas</h2></div>
          <form id="tform" class="grid">
            ${state.therapists.map(t => `<div class="fgrid">
              <div class="field"><label for="tn-${t.id}">Nombre</label><input id="tn-${t.id}" name="name-${t.id}" value="${esc(t.name)}"></div>
              <div class="field"><label for="tc-${t.id}">Color en la agenda</label><input id="tc-${t.id}" name="color-${t.id}" type="color" value="${esc(t.color)}" style="height:48px;padding:4px"></div></div>`).join("")}
            <div class="fgrid">
              <div class="field"><label for="t-dur">Duración por defecto</label><select id="t-dur" name="duration">${[45, 50, 60].map(m => `<option ${st.duration == m ? "selected" : ""} value="${m}">${m} min</option>`).join("")}</select></div>
              <div class="field"><label for="t-pin">PIN de acceso</label><input id="t-pin" name="pin" inputmode="numeric" value="${esc(st.pin)}"></div>
              <div class="field full"><label for="t-addr">Dirección del consultorio</label><input id="t-addr" name="address" value="${esc(st.address)}"></div>
            </div>
            <div class="form-actions" style="justify-content:flex-start"><button class="btn btn-dark" type="submit">Guardar</button></div>
          </form>
        </section>
        <section class="card">
          <div class="card-h"><h2>Datos</h2></div>
          <p class="hint">Los datos viven en este navegador. Descarga una copia con frecuencia o conecta una base de datos (ver README).</p>
          <div class="form-actions" style="justify-content:flex-start">
            <button class="sbtn" data-act="export">Descargar copia (JSON)</button>
            <label class="sbtn" for="import-file" style="cursor:pointer">Restaurar copia</label>
            <input id="import-file" type="file" accept="application/json" hidden>
            ${state.demo ? `<button class="sbtn danger" data-act="clear-demo">Borrar datos de ejemplo</button>` : ""}
          </div>
        </section>
      </div>
    </div>`;
  }

  /* ---------------- Google Calendar ---------------- */
  const G = ses.get(GTOKEN, { token: null, exp: 0 });
  const gConnected = () => !!G.token && Date.now() < G.exp;
  function renderGPill() {
    const p = $("#gpill"); const on = gConnected();
    p.className = "gpill" + (on ? " on" : "");
    p.innerHTML = `<i></i>${on ? "Google Calendar conectado" : "Conectar Google Calendar"}`;
  }
  function loadGis() {
    return new Promise((res, rej) => {
      if (window.google?.accounts?.oauth2) return res();
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client"; s.async = true;
      s.onload = () => res(); s.onerror = () => rej(new Error("No se pudo cargar el inicio de sesión de Google. Revisa tu conexión."));
      document.head.appendChild(s);
    });
  }
  async function gAuth() {
    if (!state.settings.googleClientId) { go("ajustes"); throw new Error("Agrega el Client ID de Google en Ajustes."); }
    await loadGis();
    return new Promise((res, rej) => {
      const tc = google.accounts.oauth2.initTokenClient({
        client_id: state.settings.googleClientId,
        scope: "https://www.googleapis.com/auth/calendar.events",
        callback: r => {
          if (r.error) return rej(new Error("Google no autorizó el acceso (" + r.error + ")."));
          G.token = r.access_token; G.exp = Date.now() + (Number(r.expires_in) - 60) * 1000; ses.set(GTOKEN, G);
          renderGPill(); res();
        },
        error_callback: e => rej(new Error(e?.type === "popup_closed" ? "Se cerró la ventana de Google." : "No se pudo abrir la ventana de Google. Permite ventanas emergentes."))
      });
      tc.requestAccessToken({ prompt: "" });
    });
  }
  async function gFetch(path, { method = "GET", body, query } = {}) {
    if (!gConnected()) await gAuth();
    const u = new URL("https://www.googleapis.com/calendar/v3/" + path);
    Object.entries(query || {}).forEach(([k, v]) => u.searchParams.set(k, v));
    const r = await fetch(u, { method, headers: { Authorization: "Bearer " + G.token, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    if (r.status === 401) { G.token = null; ses.del(GTOKEN); renderGPill(); throw new Error("La conexión con Google expiró. Vuelve a conectar."); }
    if (!r.ok && r.status !== 410) { let m = ""; try { m = (await r.json()).error.message; } catch { /* */ } throw new Error("Google Calendar: " + (m || "error " + r.status)); }
    return r.status === 204 || r.status === 410 ? null : r.json();
  }
  const evPath = (id = "") => `calendars/${encodeURIComponent(state.settings.calendarId || "primary")}/events${id ? "/" + encodeURIComponent(id) : ""}`;
  function eventBody(s, invite) {
    const c = client(s.clientId);
    const end = new Date(new Date(s.start).getTime() + s.duration * 6e4);
    const b = {
      summary: `Sesión · ${c.name}`,
      description: `Terapia ${THERAPY[c.therapy].toLowerCase()} con ${s.therapistId === "ambos" ? state.therapists.map(t => t.short).join(" y ") : therapist(s.therapistId)?.name}.\n${s.modality === "online" ? "Sesión online por Google Meet." : "Sesión presencial: " + state.settings.address}\n\nEucalipto Psicología`,
      start: { dateTime: new Date(s.start).toISOString(), timeZone: BOGOTA },
      end: { dateTime: end.toISOString(), timeZone: BOGOTA },
      reminders: { useDefault: true },
      extendedProperties: { private: { eucaliptoId: s.id } }
    };
    if (s.modality === "presencial") b.location = state.settings.address;
    if (invite && c.email) b.attendees = [{ email: c.email, displayName: c.name }];
    return b;
  }
  const meetFrom = ev => ev.hangoutLink || (ev.conferenceData?.entryPoints || []).find(e => e.entryPointType === "video")?.uri || "";
  async function settleMeet(s, ev) {
    s.meetLink = meetFrom(ev);
    if (!s.meetLink && ev.conferenceData?.createRequest?.status?.statusCode === "pending") {
      await new Promise(r => setTimeout(r, 1800));
      s.meetLink = meetFrom(await gFetch(evPath(s.gEventId)));
    }
  }
  async function gCreate(s, invite) {
    const body = eventBody(s, invite);
    if (s.modality === "online") body.conferenceData = { createRequest: { requestId: uid() + uid(), conferenceSolutionKey: { type: "hangoutsMeet" } } };
    const ev = await gFetch(evPath(), { method: "POST", body, query: { conferenceDataVersion: 1, sendUpdates: invite ? "all" : "none" } });
    s.gEventId = ev.id; s.gLink = ev.htmlLink; await settleMeet(s, ev); save();
  }
  async function gAddConference(s) {
    const ev = await gFetch(evPath(s.gEventId), { method: "PATCH", body: { conferenceData: { createRequest: { requestId: uid() + uid(), conferenceSolutionKey: { type: "hangoutsMeet" } } } }, query: { conferenceDataVersion: 1, sendUpdates: "all" } });
    await settleMeet(s, ev); save();
  }
  async function gPatchTime(s) {
    const b = eventBody(s, false);
    await gFetch(evPath(s.gEventId), { method: "PATCH", body: { start: b.start, end: b.end, summary: b.summary, description: b.description }, query: { sendUpdates: "all" } });
  }
  async function gDelete(s) {
    await gFetch(evPath(s.gEventId), { method: "DELETE", query: { sendUpdates: "all" } });
    s.gEventId = ""; s.meetLink = ""; s.gLink = ""; save();
  }
  async function gLoadWeek(ws) {
    const data = await gFetch(evPath(), { query: { timeMin: ws.toISOString(), timeMax: addDays(ws, 7).toISOString(), singleEvents: "true", orderBy: "startTime", maxResults: "250" } });
    gWeekCache[ws.toISOString()] = (data.items || [])
      .filter(e => e.status !== "cancelled" && e.start?.dateTime && !e.extendedProperties?.private?.eucaliptoId)
      .map(e => ({ summary: e.summary, start: e.start.dateTime, end: e.end.dateTime }));
  }

  /* ---------------- Eventos globales ---------------- */
  $("#new-session").addEventListener("click", () => sessionForm(null));
  $("#gpill").addEventListener("click", async () => {
    if (gConnected()) { go("ajustes"); return; }
    try { await gAuth(); toast("Google Calendar conectado"); gWeekCache = {}; render(); } catch (e) { toast(e.message); }
  });

  document.addEventListener("click", async e => {
    const nav = e.target.closest(".side-nav a");
    if (nav) { e.preventDefault(); go(nav.dataset.view); return; }
    const el = e.target.closest("[data-act]"); if (!el) return;
    const a = el.dataset.act, id = el.dataset.id;
    if (a === "session") sessionForm(id);
    else if (a === "new-session") sessionForm(null, { clientId: el.dataset.client });
    else if (a === "meet") addMeet(id, el);
    else if (a === "paid") { const s = state.sessions.find(x => x.id === id); s.paid = true; save(); toast("Pago registrado"); render(); }
    else if (a === "wk") { const n = Number(el.dataset.n); weekStart = n === 0 ? startOfWeek(new Date()) : addDays(weekStart, 7 * n); render(); }
    else if (a === "gsync") { gWeekCache = {}; render(); }
    else if (a === "open-client") go("clientes", id);
    else if (a === "back") go("clientes");
    else if (a === "new-client") clientForm(null);
    else if (a === "edit-client") clientForm(id);
    else if (a === "req-filter") { filters.reqAll = el.dataset.v === "1"; render(); }
    else if (a === "req-archive") { setReqs(getReqs().map(r => r.id === id ? { ...r, status: "archivada" } : r)); render(); }
    else if (a === "req-convert") {
      const r = getReqs().find(x => x.id === id);
      const pref = { Mariana: "t1", Esteban: "t2", "Los dos (pareja)": "ambos" }[r.preference];
      const country = COUNTRIES.find(c => c[0].startsWith(r.country))?.[0] || "Colombia";
      clientForm(null, {
        name: r.name, email: r.email, phone: r.phone, country, therapy: (r.therapy || "").toLowerCase().startsWith("pareja") ? "pareja" : (r.therapy || "").toLowerCase().startsWith("familia") ? "familia" : "individual",
        modality: r.modality === "Presencial" ? "presencial" : "online", therapistId: pref || ses.get(AUTH, "t1"), reason: r.message || "", currency: country === "Colombia" ? "COP" : "USD",
        onCreate: () => setReqs(getReqs().map(x => x.id === id ? { ...x, status: "convertida" } : x))
      });
    }
    else if (a === "gdisconnect") {
      try { if (window.google?.accounts?.oauth2 && G.token) google.accounts.oauth2.revoke(G.token, () => {}); } catch { /* */ }
      G.token = null; G.exp = 0; ses.del(GTOKEN); gWeekCache = {}; toast("Google Calendar desconectado"); render();
    }
    else if (a === "export") {
      const blob = new Blob([JSON.stringify({ ...state, requests: getReqs() }, null, 2)], { type: "application/json" });
      const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `eucalipto-copia-${inDate(new Date())}.json`; link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 2000);
    }
    else if (a === "clear-demo") confirmStep(el, "Toca otra vez para borrar", () => {
      state.clients = []; state.sessions = []; state.demo = false; save();
      setReqs(getReqs().filter(r => !r.demo)); toast("Datos de ejemplo borrados"); render();
    });
  });

  document.addEventListener("input", e => {
    if (e.target.id === "c-q") { filters.q = e.target.value; const pos = e.target.selectionStart; render(); const i = $("#c-q"); i.focus(); i.setSelectionRange(pos, pos); }
  });
  document.addEventListener("change", e => {
    const m = { "c-loc": "loc", "c-st": "st", "c-th": "th" }[e.target.id];
    if (m) { filters[m] = e.target.value; render(); }
    if (e.target.id === "import-file" && e.target.files[0]) {
      const r = new FileReader();
      r.onload = () => {
        try {
          const d = JSON.parse(r.result);
          if (!Array.isArray(d.clients) || !Array.isArray(d.sessions)) throw 0;
          if (d.requests) { setReqs(d.requests); delete d.requests; }
          state = d; save(); toast("Copia restaurada"); render();
        } catch { toast("Ese archivo no es una copia válida del portal."); }
      };
      r.readAsText(e.target.files[0]);
    }
  });
  document.addEventListener("submit", async e => {
    if (e.target.id === "gform") {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target).entries());
      Object.assign(state.settings, { googleClientId: d.googleClientId.trim(), calendarId: d.calendarId.trim() || "primary", invite: !!d.invite }); save();
      if (!state.settings.googleClientId) return toast("Guardado. Falta el Client ID para conectar.");
      try { await gAuth(); toast("Google Calendar conectado"); gWeekCache = {}; render(); } catch (err) { toast(err.message); }
    }
    if (e.target.id === "tform") {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target).entries());
      state.therapists.forEach(t => { t.name = d["name-" + t.id].trim() || t.name; t.short = t.name.split(" ")[0]; t.color = d["color-" + t.id]; });
      Object.assign(state.settings, { duration: Number(d.duration), pin: d.pin.trim() || state.settings.pin, address: d.address });
      save(); toast("Ajustes guardados"); boot();
    }
  });

  // Refresca la vista cada minuto (línea de "ahora", relojes de clientes)
  setInterval(() => { if (!$("#app").hidden && $("#modal").hidden && document.activeElement?.id !== "c-q") render(); }, 60000);

  boot();
})();
