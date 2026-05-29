import { $, $$, encodeWhatsApp } from "./utils.js";

(function initQuoteForm(){
  const form = document.querySelector('[data-form="quote"]');
  if (!form) return;

  const toast = form.querySelector("[data-toast]");
  const btnWA = form.querySelector("[data-send-whatsapp]");

  function showToast(msg, ok = true){
    if (!toast) return;
    toast.hidden = false;
    toast.textContent = msg;
    toast.classList.toggle("toast--ok", ok);
    toast.classList.toggle("toast--bad", !ok);
    setTimeout(() => { toast.hidden = true; }, 3500);
  }

  function setError(name, msg){
    const el = form.querySelector(`[data-error-for="${name}"]`);
    if (el) el.textContent = msg || "";
  }

  function getVal(name){
    const field = form.elements[name];
    return field ? String(field.value || "").trim() : "";
  }

  function validate(){
    let ok = true;

    const requiredFields = ["name","phone","email","type","destination","travelers","dateFrom"];
    requiredFields.forEach(n => setError(n, ""));

    requiredFields.forEach((n) => {
      const v = getVal(n);
      if (!v) { setError(n, "Este campo es obligatorio."); ok = false; }
    });

    const email = getVal("email");
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      setError("email", "Correo inválido.");
      ok = false;
    }

    const travelers = Number(getVal("travelers"));
    if (!Number.isFinite(travelers) || travelers < 1) {
      setError("travelers", "Ingresa un número válido.");
      ok = false;
    }

    return ok;
  }

  function buildMessage(){
    const lines = [
      "Hola Galaxy Tours, quiero una cotización:",
      `Nombre: ${getVal("name")}`,
      `WhatsApp: ${getVal("phone")}`,
      `Email: ${getVal("email")}`,
      `Tipo: ${getVal("type")}`,
      `Destino/Ruta: ${getVal("destination")}`,
      `Viajeros: ${getVal("travelers")}`,
      `Desde: ${getVal("dateFrom")}`,
      `Hasta: ${getVal("dateTo") || "N/A"}`,
      `Notas: ${getVal("notes") || "N/A"}`
    ];
    return lines.join("\n");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Revisa los campos marcados.", false);
      return;
    }

    // Aquí todavía no enviamos a backend (porque no hay API),
    // solo confirmamos y puedes luego conectar a EmailJS / backend propio.
    showToast("Listo ✅ Recibimos tu información. Te contactaremos pronto.");
    form.reset();
  });

  if (btnWA) {
    btnWA.addEventListener("click", () => {
      if (!validate()) {
        showToast("Revisa los campos antes de enviar por WhatsApp.", false);
        return;
      }
      const msg = encodeWhatsApp(buildMessage());
      const phone = "593 988557225"; // CAMBIA
      window.open(`https://wa.me/${phone}?text=${msg}`, "_blank", "noopener");
    });
  }
})();
