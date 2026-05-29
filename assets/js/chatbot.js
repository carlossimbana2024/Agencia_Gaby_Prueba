import { $, $$ } from "./utils.js";

(function initChatbot(){
  const log = document.querySelector("[data-chat-log]");
  const form = document.querySelector("[data-chat-form]");
  const input = form ? form.querySelector(".chat__input") : null;

  if (!log || !form || !input) return;

  const faqs = [
    {
      match: ["crucero", "cruceros", "disponibles"],
      answer: "Sí. Podemos cotizar cruceros según destino y fechas. Si aún no hay API, trabajamos con opciones destacadas y te confirmo disponibilidad por proveedor."
    },
    {
      match: ["paypal", "pago", "tarjeta"],
      answer: "Puedes pagar con PayPal (ideal para pagos internacionales). Si el valor varía, te envío un link con el monto exacto."
    },
    {
      match: ["cotizar", "necesito", "requisitos", "informacion"],
      answer: "Para cotizar: destino/ruta, fechas, número de viajeros y tu presupuesto aproximado (si deseas). Con eso te mando 2–3 opciones."
    },
    {
      match: ["transfer", "traslado", "transporte", "pickup"],
      answer: "Sí. Coordinamos transferencias privadas o compartidas, con pick-up, horarios y contacto del conductor."
    }
  ];

  const addMsg = (who, text) => {
    const row = document.createElement("div");
    row.className = `chat__msg chat__msg--${who}`;
    row.textContent = text;
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
  };

  const reply = (text) => {
    const t = text.toLowerCase();
    const hit = faqs.find(f => f.match.some(k => t.includes(k)));
    if (hit) return hit.answer;
    return "Te entiendo. ¿Me dices destino, fechas y número de viajeros? Si prefieres, te paso directo a WhatsApp.";
  };

  // Mensaje inicial
  addMsg("bot", "Hola 👋 Soy el asistente de Galaxy Tours. ¿En qué te ayudo?");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    addMsg("user", text);
    input.value = "";

    setTimeout(() => addMsg("bot", reply(text)), 250);
  });

  $$(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const q = btn.getAttribute("data-quick") || btn.textContent;
      addMsg("user", q);
      setTimeout(() => addMsg("bot", reply(q)), 200);
    });
  });
})();
