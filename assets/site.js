/* ============================================================
   CONFIGURACIÓN — edita aquí los datos de contacto del consultorio.
   ============================================================ */
const CONFIG = {
  whatsapp: "573000000000",            // solo números, con indicativo (57 = Colombia)
  whatsappLabel: "+57 300 000 0000",
  email: "hola@eucaliptopsicologia.com",
  city: "Bogotá",
  address: "Consultorio en Chapinero, Bogotá",
  // Horario de atención en hora de Colombia (24h)
  hours: { weekdays: [7, 20], saturday: [8, 13] },
  // Opcional: URL de Formspree / Google Apps Script / tu backend para recibir solicitudes.
  // Si está vacío, la solicitud se guarda en este navegador y se abre WhatsApp.
  formEndpoint: ""
};

const REQ_KEY = "eucalipto.requests";
const BOGOTA = "America/Bogota";

/* Pinta los datos de contacto donde haya data-config="..." */
document.querySelectorAll("[data-config]").forEach(el => {
  const v = CONFIG[el.dataset.config];
  if (v) el.textContent = v;
});
document.querySelectorAll("[data-wa]").forEach(a => {
  const msg = a.dataset.wa || "Hola, quisiera información sobre la terapia.";
  a.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
  a.target = "_blank"; a.rel = "noopener";
});
document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

/* Menú móvil */
const menuBtn = document.querySelector("[data-menu-btn]");
const menu = document.querySelector("[data-menu]");
if (menuBtn && menu) {
  menuBtn.addEventListener("click", () => {
    const open = menu.dataset.open !== "true";
    menu.dataset.open = String(open);
    menuBtn.setAttribute("aria-expanded", String(open));
  });
}

/* Relojes: hora en Colombia y hora local del visitante */
const visitorTz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return BOGOTA; } })();
function fmt(date, tz, opts = {}) {
  try { return new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz, ...opts }).format(date); }
  catch { return ""; }
}
function prettyTz(tz) { return (tz.split("/").pop() || tz).replace(/_/g, " "); }
function tickClocks() {
  const now = new Date();
  document.querySelectorAll("[data-clock]").forEach(el => {
    const tz = el.dataset.clock === "local" ? visitorTz : el.dataset.clock;
    el.textContent = fmt(now, tz);
  });
  document.querySelectorAll("[data-local-name]").forEach(el => {
    el.textContent = visitorTz === BOGOTA ? "Tu hora (Colombia)" : `Tu hora · ${prettyTz(visitorTz)}`;
  });
}
tickClocks();
setInterval(tickClocks, 20000);

/* Conversor de horario para el exterior */
const tzSelect = document.querySelector("[data-tz-select]");
if (tzSelect) {
  const rows = document.querySelector("[data-tz-rows]");
  const note = document.querySelector("[data-tz-note]");
  const options = [...tzSelect.options].map(o => o.value);
  if (options.includes(visitorTz)) tzSelect.value = visitorTz;

  // Colombia es UTC-5 todo el año (sin horario de verano)
  const bogotaToDate = (h, dayOffset) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + dayOffset);
    d.setUTCHours(h + 5, 0, 0, 0);
    return d;
  };
  const nextDow = (dow) => { // 1 = lunes … 6 = sábado
    const today = new Date(); const cur = today.getUTCDay();
    return (dow - cur + 7) % 7;
  };
  const render = () => {
    const tz = tzSelect.value;
    const blocks = [
      ["Lunes a viernes", CONFIG.hours.weekdays, nextDow(3)],
      ["Sábados", CONFIG.hours.saturday, nextDow(6)]
    ];
    rows.innerHTML = `<div class="tz-row head"><span>Día</span><span>Colombia</span><span>Tu zona</span></div>` +
      blocks.map(([label, [a, b], off]) => {
        const s = bogotaToDate(a, off), e = bogotaToDate(b, off);
        const sameDay = fmt(s, tz, { weekday: "short", hour: undefined, minute: undefined }) === fmt(e, tz, { weekday: "short", hour: undefined, minute: undefined });
        return `<div class="tz-row"><span>${label}</span><span>${String(a).padStart(2, "0")}:00 – ${b}:00</span><span>${fmt(s, tz)} – ${fmt(e, tz)}${sameDay ? "" : " (+1)"}</span></div>`;
      }).join("");
    const diff = (() => {
      const now = new Date();
      const local = new Date(now.toLocaleString("en-US", { timeZone: tz }));
      const bog = new Date(now.toLocaleString("en-US", { timeZone: BOGOTA }));
      return Math.round((local - bog) / 36e5);
    })();
    note.textContent = diff === 0
      ? "Hoy estás en la misma hora que Colombia."
      : `Hoy estás ${Math.abs(diff)} hora${Math.abs(diff) === 1 ? "" : "s"} ${diff > 0 ? "adelante" : "atrás"} de Colombia. Buscamos contigo un horario cómodo, aunque quede fuera de este rango.`;
  };
  tzSelect.addEventListener("change", render);
  render();
}

/* Formulario de solicitud de cita */
document.querySelectorAll("[data-booking-form]").forEach(form => {
  const tzField = form.querySelector("[name=timezone]");
  if (tzField) tzField.value = visitorTz;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.name || !data.email) {
      form.querySelector("[data-form-error]").hidden = false;
      return;
    }
    const request = { id: "r" + Date.now().toString(36), createdAt: new Date().toISOString(), status: "nueva", ...data };

    try {
      const list = JSON.parse(localStorage.getItem(REQ_KEY) || "[]");
      list.unshift(request);
      localStorage.setItem(REQ_KEY, JSON.stringify(list));
    } catch { /* almacenamiento no disponible */ }

    if (CONFIG.formEndpoint) {
      try {
        await fetch(CONFIG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(request) });
      } catch { /* si falla, queda WhatsApp como respaldo */ }
    }

    const text = `Hola, soy ${data.name}. Escribo desde ${data.country || "—"}. Me interesa: ${data.therapy || "terapia"} (${data.modality || "online"}). ${data.message || ""}`.trim();
    const box = form.parentElement.querySelector("[data-form-success]");
    box.querySelector("[data-success-name]").textContent = data.name.split(" ")[0];
    const wa = box.querySelector("[data-success-wa]");
    wa.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
    form.hidden = true;
    box.hidden = false;
  });
});

/* Pestañas (Colombia / exterior) */
document.querySelectorAll("[data-tabs]").forEach(list => {
  const tabs = [...list.querySelectorAll("[role=tab]")];
  tabs.forEach(tab => tab.addEventListener("click", () => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
  }));
});
