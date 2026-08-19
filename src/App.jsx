import React, { useState, useEffect, useMemo } from "react";
import {
  Droplet, Car, Truck, Calendar as CalendarIcon, Clock, MapPin, Home,
  CreditCard, Banknote, Landmark, CheckCircle2, Sparkles, ShieldCheck,
  ChevronLeft, ChevronRight, X, Loader2, PhoneCall, User, ClipboardList,
  Mail, BellRing,
} from "lucide-react";

/* ---------------------------------------------------------
   Expres Car Wash — lavado de autos a domicilio
   Paleta: tinta petróleo / espuma / turquesa / cera cítrica
--------------------------------------------------------- */

/* ---------------------------------------------------------
   Backend 24/7 (opcional): pega aquí la URL de tu servidor ya
   desplegado (Railway, Render, etc.), ej:
   "https://labrillo-backend.up.railway.app"
   Mientras esté vacío, la app sigue funcionando en modo demo
   (guarda todo localmente, sin recordatorios automáticos reales).
--------------------------------------------------------- */
const API_BASE = "https://labrillo-backend-production.up.railway.app";
const ADMIN_KEY_HEADER = "labrillo2026"; // debe calzar con ADMIN_KEY del backend

const TOKENS = {
  ink: "#0F3B3A",
  bg: "#F5FAF8",
  teal: "#146B67",
  tealDark: "#0C4A46",
  aqua: "#6FCFC4",
  wax: "#F2A93B",
  charcoal: "#1F2A28",
  line: "#D9EAE6",
};

const SIZES = [
  { id: "chico", label: "Auto chico", sub: "Hatchback / city car", price: 7000, icon: Car },
  { id: "mediano", label: "Auto mediano", sub: "Sedán", price: 9000, icon: Car },
  { id: "grande", label: "Grande / SUV", sub: "SUV / crossover", price: 12000, icon: Truck },
  { id: "camioneta", label: "Camioneta / 4x4", sub: "Pickup / van", price: 15000, icon: Truck },
];

const EXTRAS = [
  { id: "tapices", label: "Limpieza profunda de tapices", price: 5000 },
  { id: "goma", label: "Renovador de goma neumáticos (4 ruedas)", price: 3000 },
];

/* ---------------------------------------------------------
   EmailJS (opcional): recordatorio 3h antes del lavado.
   Crea una cuenta gratis en emailjs.com, un servicio de correo
   y una plantilla con variables {{to_email}}, {{to_name}},
   {{fecha}}, {{hora}}, {{ubicacion}}. Pega tus IDs abajo.
   Mientras estén vacíos, el botón de recordatorio solo simula
   el envío (marca como enviado) sin mandar un correo real.
--------------------------------------------------------- */
const EMAILJS_SERVICE_ID = "";
const EMAILJS_TEMPLATE_ID = "";
const EMAILJS_PUBLIC_KEY = "";

async function sendReminderEmail(booking) {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    // Sin credenciales configuradas: simulamos el envío.
    await new Promise((r) => setTimeout(r, 500));
    return { ok: true, simulated: true };
  }
  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: booking.email,
          to_name: booking.name,
          fecha: booking.dateLabel,
          hora: booking.time,
          ubicacion: booking.location === "domicilio" ? booking.address : "Expres Car Wash (Labranza)",
        },
      }),
    });
    return { ok: res.ok, simulated: false };
  } catch (e) {
    return { ok: false, simulated: false };
  }
}

function reminderTimestamp(booking) {
  // hora del lavado - 3 horas
  const dt = new Date(`${booking.dateKey}T${booking.time}:00`);
  dt.setHours(dt.getHours() - 3);
  return dt.getTime();
}

const HOURS = ["09:00","10:30","12:00","13:30","15:00","16:30","18:00"];
const CLP = (n) => n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

function nextDays(n) {
  const out = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push(d);
  }
  return out;
}
const dateKey = (d) => d.toISOString().slice(0, 10);
const dayLabel = (d) => d.toLocaleDateString("es-CL", { weekday: "short", day: "2-digit", month: "short" });

/* ---------------------------- Droplet step indicator ---------------------------- */
function StepDrops({ step, total }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <Droplet
          key={i}
          size={16}
          className="transition-all duration-300"
          style={{
            color: i <= step ? TOKENS.teal : TOKENS.line,
            fill: i <= step ? TOKENS.teal : "transparent",
            transform: i === step ? "scale(1.3)" : "scale(1)",
          }}
        />
      ))}
    </div>
  );
}

/* ---------------------------- Hero shine sweep ---------------------------- */
function HeroCar() {
  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-3xl" style={{ background: `linear-gradient(160deg, ${TOKENS.tealDark}, ${TOKENS.teal})` }}>
      <style>{`
        @keyframes sweep { 0% { transform: translateX(-120%) skewX(-12deg); } 55% { transform: translateX(140%) skewX(-12deg); } 100% { transform: translateX(140%) skewX(-12deg); } }
        .shine-sweep { animation: sweep 3.2s ease-in-out infinite; animation-delay: .6s; }
        @keyframes bob { 0%,100% { transform: translateY(0px);} 50% { transform: translateY(-6px);} }
        .bob { animation: bob 3.6s ease-in-out infinite; }
      `}</style>
      <div className="relative p-10 flex flex-col items-center justify-center min-h-[260px]">
        <div className="bob">
          <svg width="220" height="100" viewBox="0 0 220 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 70 Q15 55 35 52 L55 30 Q65 20 85 20 L140 20 Q158 20 168 34 L188 52 Q205 54 205 70 L205 78 L15 78 Z" fill="#EAF7F5" />
            <path d="M85 24 L75 46 L150 46 L140 24 Z" fill={TOKENS.tealDark} opacity="0.25" />
            <circle cx="55" cy="80" r="14" fill={TOKENS.ink} />
            <circle cx="55" cy="80" r="6" fill={TOKENS.aqua} />
            <circle cx="165" cy="80" r="14" fill={TOKENS.ink} />
            <circle cx="165" cy="80" r="6" fill={TOKENS.aqua} />
          </svg>
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="shine-sweep absolute top-0 left-0 h-full w-1/4" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)" }} />
        </div>
        <div className="flex gap-1 mt-4">
          {[0,1,2].map((i) => (
            <Droplet key={i} size={14} style={{ color: TOKENS.aqua, fill: TOKENS.aqua }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Main App ---------------------------- */
export default function App() {
  const [view, setView] = useState("home"); // home | booking | confirmed | admin
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadedStore, setLoadedStore] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [adminOk, setAdminOk] = useState(false);

  const [form, setForm] = useState({
    sizeId: "",
    extraIds: [],
    location: "domicilio", // domicilio | local
    confirmLuzAgua: false,
    address: "",
    dateIdx: 0,
    time: "",
    name: "",
    phone: "",
    email: "",
    payment: "",
  });

  const days = useMemo(() => nextDays(7), []);

  useEffect(() => {
    (async () => {
      if (API_BASE) return; // en modo backend, las reservas se cargan al abrir el panel admin
      try {
        const res = await window.storage.get("all-bookings", true);
        if (res && res.value) setBookings(JSON.parse(res.value));
      } catch (e) {
        // no bookings yet
      } finally {
        setLoadedStore(true);
      }
    })();
  }, []);

  const size = SIZES.find((s) => s.id === form.sizeId);
  const extrasTotal = form.extraIds.reduce((sum, id) => sum + EXTRAS.find((e) => e.id === id).price, 0);
  const locationAdj = form.location === "local" ? -1000 : 0;
  const total = (size ? size.price : 0) + extrasTotal + locationAdj;

  const selectedDate = days[form.dateIdx];
  const takenTimes = bookings
    .filter((b) => b.dateKey === dateKey(selectedDate))
    .map((b) => b.time);

  function update(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function startBooking() {
    setForm({
      sizeId: "", extraIds: [], location: "domicilio", confirmLuzAgua: false,
      address: "", dateIdx: 0, time: "", name: "", phone: "", email: "", payment: "",
    });
    setStep(0);
    setView("booking");
  }

  function canAdvance() {
    if (step === 0) return !!form.sizeId;
    if (step === 1) return true;
    if (step === 2) {
      if (form.location === "domicilio") return form.confirmLuzAgua && form.address.trim().length > 4;
      return true;
    }
    if (step === 3) return !!form.time;
    if (step === 4) return form.name.trim().length > 1 && form.phone.trim().length > 6 && /^\S+@\S+\.\S+$/.test(form.email.trim());
    if (step === 5) return !!form.payment;
    return true;
  }

  async function confirmBooking() {
    setSaving(true);
    const booking = {
      id: `${Date.now()}`,
      sizeId: form.sizeId,
      sizeLabel: size.label,
      extras: form.extraIds.map((id) => EXTRAS.find((e) => e.id === id).label),
      location: form.location,
      address: form.location === "domicilio" ? form.address : "Expres Car Wash (base Labranza)",
      dateKey: dateKey(selectedDate),
      dateLabel: dayLabel(selectedDate),
      time: form.time,
      name: form.name,
      phone: form.phone,
      email: form.email,
      payment: form.payment,
      total,
      createdAt: new Date().toISOString(),
      reminderSent: false,
    };
    booking.reminderAt = reminderTimestamp(booking);

    try {
      if (API_BASE) {
        const res = await fetch(`${API_BASE}/api/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(booking),
        });
        if (!res.ok) throw new Error("Backend rechazó la reserva");
        const saved = await res.json();
        setLastBooking(saved);
      } else {
        const updated = [...bookings, booking];
        await window.storage.set("all-bookings", JSON.stringify(updated), true);
        setBookings(updated);
        setLastBooking(booking);
      }
      setView("confirmed");
    } catch (e) {
      alert("No se pudo guardar la reserva. Revisa tu conexión e intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen w-full" style={{ background: TOKENS.bg, fontFamily: "Inter, system-ui, sans-serif", color: TOKENS.charcoal }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
        .font-display { font-family: 'Space Grotesk', Inter, sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur border-b" style={{ background: "rgba(245,250,248,0.9)", borderColor: TOKENS.line }}>
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <button onClick={() => setView("home")} className="flex items-center gap-2 font-display font-bold text-lg" style={{ color: TOKENS.ink }}>
            <Droplet size={22} style={{ color: TOKENS.teal, fill: TOKENS.aqua }} />
            Expres Car Wash
          </button>
          <button
            onClick={() => setAdminOpen(true)}
            className="text-xs font-medium flex items-center gap-1 px-3 py-1.5 rounded-full border hover:opacity-80 transition"
            style={{ borderColor: TOKENS.line, color: TOKENS.teal }}
          >
            <ClipboardList size={14} /> Reservas
          </button>
        </div>
      </header>

      {view === "home" && (
        <Home_
          startBooking={startBooking}
          days={days}
        />
      )}

      {view === "booking" && (
        <BookingWizard
          step={step} setStep={setStep}
          form={form} update={update}
          size={size} extrasTotal={extrasTotal} locationAdj={locationAdj} total={total}
          days={days} selectedDate={selectedDate} takenTimes={takenTimes}
          canAdvance={canAdvance} confirmBooking={confirmBooking} saving={saving}
          onCancel={() => setView("home")}
        />
      )}

      {view === "confirmed" && lastBooking && (
        <Confirmed booking={lastBooking} onHome={() => setView("home")} />
      )}

      {adminOpen && (
        <AdminModal
          onClose={() => { setAdminOpen(false); }}
          adminOk={adminOk} setAdminOk={setAdminOk}
          adminPass={adminPass} setAdminPass={setAdminPass}
          bookings={bookings}
          onBookingsChange={setBookings}
        />
      )}

      <footer className="mt-16 py-8 text-center text-xs" style={{ color: TOKENS.teal }}>
        Expres Car Wash · Lavado de autos a domicilio · Labranza — <span className="font-mono">"Tu auto impecable, express"</span>
      </footer>
    </div>
  );
}

/* ---------------------------- Home / Landing ---------------------------- */
function Home_({ startBooking }) {
  return (
    <main className="max-w-5xl mx-auto px-5">
      {/* Hero */}
      <section className="grid md:grid-cols-2 gap-8 items-center pt-10 pb-16">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-4" style={{ background: TOKENS.aqua + "33", color: TOKENS.tealDark }}>
            <Sparkles size={13} /> Labranza y alrededores
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight" style={{ color: TOKENS.ink }}>
            Tu auto brilla,<br />sin moverte de casa.
          </h1>
          <p className="mt-4 text-base leading-relaxed" style={{ color: TOKENS.charcoal + "CC" }}>
            Lavado exterior e interior a domicilio. Tú eliges: lo hacemos en tu casa
            (con luz y agua disponibles) o lo traes a <b>Expres Car Wash</b>, nuestra base en Labranza.
          </p>
          <button
            onClick={startBooking}
            className="mt-7 inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-full text-white shadow-lg hover:brightness-105 active:scale-[0.98] transition"
            style={{ background: TOKENS.wax, boxShadow: `0 8px 24px -8px ${TOKENS.wax}99` }}
          >
            Reservar lavado <ChevronRight size={18} />
          </button>
        </div>
        <HeroCar />
      </section>

      {/* Pricing */}
      <section className="py-10">
        <h2 className="font-display text-2xl font-bold mb-1" style={{ color: TOKENS.ink }}>Precios por tamaño</h2>
        <p className="text-sm mb-6" style={{ color: TOKENS.charcoal + "99" }}>Incluye lavado exterior + interior (aspirado).</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {SIZES.map((s) => (
            <div key={s.id} className="rounded-2xl border p-5 flex items-center justify-between hover:shadow-md transition" style={{ borderColor: TOKENS.line, background: "white" }}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl" style={{ background: TOKENS.aqua + "26" }}>
                  <s.icon size={22} style={{ color: TOKENS.teal }} />
                </div>
                <div>
                  <div className="font-semibold" style={{ color: TOKENS.ink }}>{s.label}</div>
                  <div className="text-xs" style={{ color: TOKENS.charcoal + "88" }}>{s.sub}</div>
                </div>
              </div>
              <div className="font-mono font-semibold text-lg" style={{ color: TOKENS.teal }}>{CLP(s.price)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Extras */}
      <section className="py-6">
        <h2 className="font-display text-2xl font-bold mb-1" style={{ color: TOKENS.ink }}>Extras opcionales</h2>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          {EXTRAS.map((e) => (
            <div key={e.id} className="rounded-2xl border p-4" style={{ borderColor: TOKENS.line, background: "white" }}>
              <div className="text-sm font-medium" style={{ color: TOKENS.ink }}>{e.label}</div>
              <div className="font-mono text-sm mt-2" style={{ color: TOKENS.wax }}>+ {CLP(e.price)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Location explainer */}
      <section className="py-10 grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${TOKENS.teal}, ${TOKENS.tealDark})` }}>
          <Home size={22} className="mb-2" />
          <div className="font-semibold">A domicilio</div>
          <p className="text-sm mt-1 opacity-90">Lo lavamos en tu casa. Necesitas tener luz y agua disponibles ese día.</p>
        </div>
        <div className="rounded-2xl p-5 border" style={{ borderColor: TOKENS.line, background: "white" }}>
          <MapPin size={22} className="mb-2" style={{ color: TOKENS.teal }} />
          <div className="font-semibold" style={{ color: TOKENS.ink }}>En Expres Car Wash</div>
          <p className="text-sm mt-1" style={{ color: TOKENS.charcoal + "AA" }}>Traes tu auto a nuestra base en Labranza. Ahorras $1.000.</p>
        </div>
      </section>
    </main>
  );
}

/* ---------------------------- Booking Wizard ---------------------------- */
const STEP_TITLES = ["Tamaño del auto", "Extras", "Ubicación", "Fecha y hora", "Tus datos", "Pago", "Confirmar"];

function BookingWizard({ step, setStep, form, update, size, extrasTotal, locationAdj, total, days, selectedDate, takenTimes, canAdvance, confirmBooking, saving, onCancel }) {
  const total_steps = STEP_TITLES.length;

  return (
    <main className="max-w-xl mx-auto px-5 py-8">
      <div className="flex items-center justify-between mb-2">
        <button onClick={onCancel} className="text-sm flex items-center gap-1" style={{ color: TOKENS.teal }}>
          <X size={16} /> Cancelar
        </button>
        <span className="text-xs font-mono" style={{ color: TOKENS.charcoal + "88" }}>{step + 1}/{total_steps}</span>
      </div>
      <StepDrops step={step} total={total_steps} />
      <h2 className="font-display text-xl font-bold text-center mb-6" style={{ color: TOKENS.ink }}>{STEP_TITLES[step]}</h2>

      <div className="rounded-2xl border p-5 bg-white" style={{ borderColor: TOKENS.line }}>
        {step === 0 && (
          <div className="grid grid-cols-2 gap-3">
            {SIZES.map((s) => (
              <button
                key={s.id}
                onClick={() => update({ sizeId: s.id })}
                className="rounded-xl border p-4 text-left transition"
                style={{
                  borderColor: form.sizeId === s.id ? TOKENS.teal : TOKENS.line,
                  background: form.sizeId === s.id ? TOKENS.aqua + "1A" : "white",
                }}
              >
                <s.icon size={20} style={{ color: TOKENS.teal }} />
                <div className="font-semibold text-sm mt-2" style={{ color: TOKENS.ink }}>{s.label}</div>
                <div className="font-mono text-xs mt-1" style={{ color: TOKENS.teal }}>{CLP(s.price)}</div>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            {EXTRAS.map((e) => {
              const checked = form.extraIds.includes(e.id);
              return (
                <button
                  key={e.id}
                  onClick={() => update({ extraIds: checked ? form.extraIds.filter((id) => id !== e.id) : [...form.extraIds, e.id] })}
                  className="w-full flex items-center justify-between rounded-xl border p-4 text-left transition"
                  style={{ borderColor: checked ? TOKENS.teal : TOKENS.line, background: checked ? TOKENS.aqua + "1A" : "white" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-md border flex items-center justify-center" style={{ borderColor: TOKENS.teal, background: checked ? TOKENS.teal : "white" }}>
                      {checked && <CheckCircle2 size={14} color="white" />}
                    </div>
                    <span className="text-sm font-medium" style={{ color: TOKENS.ink }}>{e.label}</span>
                  </div>
                  <span className="font-mono text-sm" style={{ color: TOKENS.wax }}>+{CLP(e.price)}</span>
                </button>
              );
            })}
            <p className="text-xs pt-1" style={{ color: TOKENS.charcoal + "88" }}>Puedes saltar este paso si no quieres extras.</p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => update({ location: "domicilio" })} className="rounded-xl border p-4 text-left" style={{ borderColor: form.location === "domicilio" ? TOKENS.teal : TOKENS.line, background: form.location === "domicilio" ? TOKENS.aqua + "1A" : "white" }}>
                <Home size={18} style={{ color: TOKENS.teal }} />
                <div className="font-semibold text-sm mt-2" style={{ color: TOKENS.ink }}>A domicilio</div>
                <div className="text-xs mt-1" style={{ color: TOKENS.charcoal + "88" }}>Requiere luz y agua</div>
              </button>
              <button onClick={() => update({ location: "local" })} className="rounded-xl border p-4 text-left" style={{ borderColor: form.location === "local" ? TOKENS.teal : TOKENS.line, background: form.location === "local" ? TOKENS.aqua + "1A" : "white" }}>
                <MapPin size={18} style={{ color: TOKENS.teal }} />
                <div className="font-semibold text-sm mt-2" style={{ color: TOKENS.ink }}>En Expres Car Wash</div>
                <div className="text-xs mt-1" style={{ color: TOKENS.wax }}>Ahorras $1.000</div>
              </button>
            </div>

            {form.location === "domicilio" ? (
              <div className="space-y-3">
                <label className="text-xs font-medium block" style={{ color: TOKENS.ink }}>Dirección</label>
                <input
                  value={form.address}
                  onChange={(e) => update({ address: e.target.value })}
                  placeholder="Calle, número, comuna"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                  style={{ borderColor: TOKENS.line }}
                />
                <button
                  onClick={() => update({ confirmLuzAgua: !form.confirmLuzAgua })}
                  className="w-full flex items-center gap-3 rounded-xl border p-3 text-left"
                  style={{ borderColor: form.confirmLuzAgua ? TOKENS.teal : TOKENS.line, background: form.confirmLuzAgua ? TOKENS.aqua + "1A" : "white" }}
                >
                  <div className="w-5 h-5 rounded-md border flex items-center justify-center shrink-0" style={{ borderColor: TOKENS.teal, background: form.confirmLuzAgua ? TOKENS.teal : "white" }}>
                    {form.confirmLuzAgua && <CheckCircle2 size={14} color="white" />}
                  </div>
                  <span className="text-xs" style={{ color: TOKENS.ink }}>Confirmo que tendré luz y agua disponibles el día del lavado.</span>
                </button>
              </div>
            ) : (
              <div className="rounded-xl p-3 text-xs flex items-center gap-2" style={{ background: TOKENS.aqua + "1A", color: TOKENS.tealDark }}>
                <ShieldCheck size={16} /> Te compartiremos la dirección de Expres Car Wash al confirmar tu hora.
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {days.map((d, i) => (
                <button
                  key={i}
                  onClick={() => update({ dateIdx: i, time: "" })}
                  className="shrink-0 rounded-xl border px-3 py-2 text-xs font-medium"
                  style={{ borderColor: form.dateIdx === i ? TOKENS.teal : TOKENS.line, background: form.dateIdx === i ? TOKENS.teal : "white", color: form.dateIdx === i ? "white" : TOKENS.charcoal }}
                >
                  {dayLabel(d)}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {HOURS.map((h) => {
                const taken = takenTimes.includes(h);
                return (
                  <button
                    key={h}
                    disabled={taken}
                    onClick={() => update({ time: h })}
                    className="rounded-lg border py-2 text-sm font-mono disabled:opacity-35 disabled:cursor-not-allowed"
                    style={{ borderColor: form.time === h ? TOKENS.teal : TOKENS.line, background: form.time === h ? TOKENS.teal : "white", color: form.time === h ? "white" : TOKENS.ink }}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: TOKENS.ink }}>Nombre</label>
              <div className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: TOKENS.line }}>
                <User size={15} style={{ color: TOKENS.teal }} />
                <input value={form.name} onChange={(e) => update({ name: e.target.value })} placeholder="Tu nombre" className="w-full text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: TOKENS.ink }}>Teléfono</label>
              <div className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: TOKENS.line }}>
                <PhoneCall size={15} style={{ color: TOKENS.teal }} />
                <input value={form.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="+56 9 ..." className="w-full text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: TOKENS.ink }}>Correo electrónico</label>
              <div className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: TOKENS.line }}>
                <Mail size={15} style={{ color: TOKENS.teal }} />
                <input value={form.email} onChange={(e) => update({ email: e.target.value })} placeholder="tucorreo@ejemplo.com" type="email" className="w-full text-sm outline-none" />
              </div>
              <p className="text-[11px] mt-1" style={{ color: TOKENS.charcoal + "77" }}>Te enviaremos un recordatorio 3 horas antes del lavado.</p>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="grid gap-3">
            {[
              { id: "efectivo", label: "Efectivo al momento", icon: Banknote },
              { id: "transferencia", label: "Transferencia bancaria", icon: Landmark },
              { id: "tarjeta", label: "Tarjeta (simulado)", icon: CreditCard },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => update({ payment: p.id })}
                className="flex items-center gap-3 rounded-xl border p-4 text-left"
                style={{ borderColor: form.payment === p.id ? TOKENS.teal : TOKENS.line, background: form.payment === p.id ? TOKENS.aqua + "1A" : "white" }}
              >
                <p.icon size={18} style={{ color: TOKENS.teal }} />
                <span className="text-sm font-medium" style={{ color: TOKENS.ink }}>{p.label}</span>
              </button>
            ))}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-3 text-sm">
            <SummaryRow label="Auto" value={size?.label} />
            <SummaryRow label="Extras" value={form.extraIds.length ? form.extraIds.map((id) => EXTRAS.find((e) => e.id === id).label).join(", ") : "Ninguno"} />
            <SummaryRow label="Ubicación" value={form.location === "domicilio" ? `Domicilio — ${form.address}` : "Expres Car Wash (Labranza)"} />
            <SummaryRow label="Fecha" value={`${dayLabel(selectedDate)} · ${form.time}`} />
            <SummaryRow label="Cliente" value={`${form.name} — ${form.phone}`} />
            <SummaryRow label="Correo" value={form.email} />
            <SummaryRow label="Pago" value={form.payment} />
            <div className="pt-3 mt-2 border-t flex items-center justify-between" style={{ borderColor: TOKENS.line }}>
              <span className="font-semibold" style={{ color: TOKENS.ink }}>Total</span>
              <span className="font-mono font-bold text-lg" style={{ color: TOKENS.teal }}>{CLP(total)}</span>
            </div>
          </div>
        )}
      </div>

      {step < 6 && (
        <div className="rounded-xl mt-4 p-3 flex items-center justify-between text-sm" style={{ background: TOKENS.ink, color: "white" }}>
          <span>Subtotal</span>
          <span className="font-mono font-semibold">{CLP((size ? size.price : 0) + extrasTotal + locationAdj)}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1 px-4 py-2.5 rounded-full text-sm font-medium disabled:opacity-30"
          style={{ color: TOKENS.teal }}
        >
          <ChevronLeft size={16} /> Atrás
        </button>

        {step < 6 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
            className="flex items-center gap-1 px-6 py-2.5 rounded-full text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: TOKENS.teal }}
          >
            Siguiente <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={confirmBooking}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ background: TOKENS.wax }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {saving ? "Guardando..." : "Confirmar reserva"}
          </button>
        )}
      </div>
    </main>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span style={{ color: TOKENS.charcoal + "88" }}>{label}</span>
      <span className="text-right font-medium" style={{ color: TOKENS.ink }}>{value}</span>
    </div>
  );
}

/* ---------------------------- Confirmed ---------------------------- */
function Confirmed({ booking, onHome }) {
  return (
    <main className="max-w-md mx-auto px-5 py-16 text-center">
      <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: TOKENS.aqua + "33" }}>
        <CheckCircle2 size={32} style={{ color: TOKENS.teal }} />
      </div>
      <h2 className="font-display text-2xl font-bold" style={{ color: TOKENS.ink }}>¡Reserva confirmada!</h2>
      <p className="text-sm mt-2" style={{ color: TOKENS.charcoal + "99" }}>Te contactaremos al {booking.phone} para confirmar detalles.</p>

      <div className="rounded-2xl border p-5 mt-6 text-left text-sm space-y-2 bg-white" style={{ borderColor: TOKENS.line }}>
        <SummaryRow label="Auto" value={booking.sizeLabel} />
        <SummaryRow label="Fecha" value={`${booking.dateLabel} · ${booking.time}`} />
        <SummaryRow label="Ubicación" value={booking.location === "domicilio" ? "Domicilio" : "Expres Car Wash"} />
        <SummaryRow label="Pago" value={booking.payment} />
        <div className="pt-3 mt-1 border-t flex items-center justify-between" style={{ borderColor: TOKENS.line }}>
          <span className="font-semibold" style={{ color: TOKENS.ink }}>Total</span>
          <span className="font-mono font-bold" style={{ color: TOKENS.teal }}>{CLP(booking.total)}</span>
        </div>
      </div>

      <button onClick={onHome} className="mt-8 px-6 py-2.5 rounded-full text-sm font-semibold text-white" style={{ background: TOKENS.teal }}>
        Volver al inicio
      </button>
    </main>
  );
}

/* ---------------------------- Admin ---------------------------- */
function AdminModal({ onClose, adminOk, setAdminOk, adminPass, setAdminPass, bookings, onBookingsChange }) {
  const [tab, setTab] = useState("reservas"); // reservas | recordatorios
  const [sendingId, setSendingId] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const now = Date.now();

  const upcoming = [...bookings]
    .filter((b) => !b.reminderSent)
    .sort((a, b) => (a.reminderAt || 0) - (b.reminderAt || 0));

  async function loadFromBackend() {
    setLoadingList(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, { headers: { "x-admin-key": adminPass || ADMIN_KEY_HEADER } });
      if (res.ok) onBookingsChange(await res.json());
    } catch (e) {
      // ignore
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    if (adminOk && API_BASE) loadFromBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminOk]);

  async function handleSend(b) {
    setSendingId(b.id);
    if (API_BASE) {
      try {
        await fetch(`${API_BASE}/api/bookings/${b.id}/notify`, { method: "POST", headers: { "x-admin-key": adminPass || ADMIN_KEY_HEADER } });
        await loadFromBackend();
      } catch (e) {
        // ignore
      }
    } else {
      const result = await sendReminderEmail(b);
      const updated = bookings.map((x) => (x.id === b.id ? { ...x, reminderSent: true, reminderSimulated: result.simulated } : x));
      try {
        await window.storage.set("all-bookings", JSON.stringify(updated), true);
        onBookingsChange(updated);
      } catch (e) {
        // ignore
      }
    }
    setSendingId(null);
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4" style={{ background: "rgba(15,59,58,0.5)" }}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold" style={{ color: TOKENS.ink }}>Panel Expres Car Wash</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        {!adminOk ? (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: TOKENS.charcoal + "88" }}>Acceso solo para Expres Car Wash. Ingresa la clave.</p>
            <input
              type="password"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              placeholder="Clave"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: TOKENS.line }}
            />
            <button
              onClick={async () => {
                if (!API_BASE) { setAdminOk(adminPass === ADMIN_KEY_HEADER); return; }
                try {
                  const res = await fetch(`${API_BASE}/api/bookings`, { headers: { "x-admin-key": adminPass } });
                  setAdminOk(res.ok);
                } catch (e) { setAdminOk(false); }
              }}
              className="w-full rounded-full py-2 text-sm font-semibold text-white"
              style={{ background: TOKENS.teal }}
            >
              Entrar
            </button>
          </div>
        ) : (
          <>
            <div className="text-[11px] mb-3 px-2 py-1 rounded-full inline-block" style={{ background: API_BASE ? TOKENS.aqua + "33" : TOKENS.wax + "22", color: API_BASE ? TOKENS.tealDark : TOKENS.wax }}>
              {API_BASE ? "🟢 Conectado al servidor 24/7" : "🟡 Modo demo (sin servidor conectado)"}
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setTab("reservas")} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: tab === "reservas" ? TOKENS.teal : TOKENS.line, color: tab === "reservas" ? "white" : TOKENS.ink }}>Reservas</button>
              <button onClick={() => setTab("recordatorios")} className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1" style={{ background: tab === "recordatorios" ? TOKENS.teal : TOKENS.line, color: tab === "recordatorios" ? "white" : TOKENS.ink }}>
                <BellRing size={12} /> Recordatorios
              </button>
            </div>

            {tab === "reservas" ? (
              bookings.length === 0 ? (
                <p className="text-sm" style={{ color: TOKENS.charcoal + "88" }}>Aún no hay reservas.</p>
              ) : (
                <div className="space-y-3">
                  {[...bookings].reverse().map((b) => (
                    <div key={b.id} className="rounded-xl border p-3 text-xs" style={{ borderColor: TOKENS.line }}>
                      <div className="flex justify-between font-semibold" style={{ color: TOKENS.ink }}>
                        <span>{b.name}</span>
                        <span className="font-mono">{CLP(b.total)}</span>
                      </div>
                      <div style={{ color: TOKENS.charcoal + "99" }}>{b.sizeLabel} · {b.dateLabel} {b.time} · {b.location === "domicilio" ? b.address : "Expres Car Wash"}</div>
                      <div style={{ color: TOKENS.charcoal + "77" }}>Tel: {b.phone} · {b.email} · Pago: {b.payment}</div>
                    </div>
                  ))}
                </div>
              )
            ) : upcoming.length === 0 ? (
              <p className="text-sm" style={{ color: TOKENS.charcoal + "88" }}>No hay recordatorios pendientes.</p>
            ) : (
              <div className="space-y-3">
                <p className="text-[11px]" style={{ color: TOKENS.charcoal + "77" }}>
                  Ordenados por urgencia. El botón envía el correo (o lo simula si EmailJS no está configurado).
                </p>
                {upcoming.map((b) => {
                  const due = now >= b.reminderAt;
                  return (
                    <div key={b.id} className="rounded-xl border p-3 text-xs flex items-center justify-between gap-3" style={{ borderColor: due ? TOKENS.wax : TOKENS.line, background: due ? TOKENS.wax + "14" : "white" }}>
                      <div>
                        <div className="font-semibold" style={{ color: TOKENS.ink }}>{b.name} · {b.dateLabel} {b.time}</div>
                        <div style={{ color: TOKENS.charcoal + "88" }}>{b.email}</div>
                        <div style={{ color: due ? TOKENS.wax : TOKENS.charcoal + "77" }}>{due ? "Ventana de 3h alcanzada" : `Recordatorio: ${new Date(b.reminderAt).toLocaleString("es-CL")}`}</div>
                      </div>
                      <button
                        onClick={() => handleSend(b)}
                        disabled={sendingId === b.id}
                        className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold text-white flex items-center gap-1"
                        style={{ background: TOKENS.teal }}
                      >
                        {sendingId === b.id ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
                        Enviar
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
