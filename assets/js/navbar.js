import { $, $$ } from "./utils.js";

(function initNavbar(){
  const toggle = $("#navToggle");
  const menu = $("#navMenu");
  if (!toggle || !menu) return;

  const close = () => {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Cierra al hacer click en un link (en móvil)
  $$(".nav__link, .nav__cta a", menu).forEach(a => {
    a.addEventListener("click", close);
  });

  // Cierra con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();
