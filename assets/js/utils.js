export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function setYear(id = "year") {
  const el = document.getElementById(id);
  if (el) el.textContent = new Date().getFullYear();
}

export function encodeWhatsApp(text) {
  return encodeURIComponent(text.trim());
}
