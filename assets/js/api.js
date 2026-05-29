/* Galápagos real-time availability API - final commercial version */
const API_BASE = "https://galagentssystem.com/api/v3/availability/search/ship";
const PROXY_URL = "";
const WHATSAPP_NUMBER = "593988557225";

const SHIPS = [
  { id: 0, name: "All cruises" },
  { id: 1, name: "M/Y Galaxy" },
  { id: 2, name: "M/C EcoGalaxy" },
  { id: 3, name: "M/C Alya" },
  { id: 4, name: "M/Y Bonita" },
  { id: 5, name: "M/Y Galaxy Diver" },
  { id: 6, name: "M/Y Galaxy Daily" },
  { id: 7, name: "M/Y Galaxy Sirius" },
  { id: 8, name: "M/Y Galaxy Diver II" },
  { id: 9, name: "M/Y Galaxy Orion" },
  { id: 10, name: "M/Y Galaxy Zibo" }
];

const SHIP_IMAGES = [
  { match: ["zibo"], src: "../assets/img/cruises/zibo.jpg" },
  { match: ["orion"], src: "../assets/img/cruises/orion.jpg" },
  { match: ["sirius"], src: "../assets/img/cruises/sirius.jpg" },
  { match: ["diver ii", "diver 2", "diver"], src: "../assets/img/cruises/diver2.jpg" },
  { match: ["bonita"], src: "../assets/img/cruises/bonita.jpg" },
  { match: ["alya"], src: "../assets/img/cruises/alya.jpg" },
  { match: ["ecogalaxy", "eco galaxy"], src: "../assets/img/cruises/ecogalaxy.jpg" },
  { match: ["galaxy daily"], src: "../assets/img/cruises/galaxy.jpg" },
  { match: ["galaxy"], src: "../assets/img/cruises/galaxy.jpg" }
];

(function initAvailabilityAPI(){
  const list = document.querySelector("[data-cruise-list]");
  const btn = document.querySelector("[data-cruise-search]");
  const shipSelect = document.querySelector('[data-cruise-filter="ship"]');
  const startInput = document.querySelector('[data-cruise-filter="start"]');
  const endInput = document.querySelector('[data-cruise-filter="end"]');
  const status = document.querySelector("[data-api-status]");
  const resultsIntro = document.querySelector("[data-results-intro]");

  if (!list || !btn || !shipSelect || !startInput || !endInput) return;

  fillShipOptions();
  setDefaultDates();
  renderEmptyState();

  btn.addEventListener("click", searchAvailability);

  function fillShipOptions(){
    shipSelect.innerHTML = SHIPS.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
  }

  function setDefaultDates(){
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + 30);
    const end = new Date(start);
    end.setDate(start.getDate() + 21);
    startInput.value = formatInputDate(start);
    endInput.value = formatInputDate(end);
  }

  function formatInputDate(date){
    return date.toISOString().slice(0, 10);
  }

  async function searchAvailability(){
    const shipId = shipSelect.value || "0";
    const start = startInput.value;
    const end = endInput.value;

    if (!start || !end) {
      showStatus("Choose a start and end date to search availability.", "warning");
      return;
    }

    if (new Date(end) < new Date(start)) {
      showStatus("The end date must be after the start date.", "warning");
      return;
    }

    showLoading();

    try {
      const data = await getAvailability(shipId, start, end);
      const items = normalizeAvailability(data).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      renderResults(items);
      showStatus(`${items.length} premium cruise option${items.length === 1 ? "" : "s"} found.`, "success");
    } catch (error) {
      console.error(error);
      renderError();
      showStatus("The browser could not load the real-time API. A Vercel/Node proxy may be required before launch.", "error");
    }
  }

  async function getAvailability(shipId, start, end){
    const url = `${API_BASE}/${shipId}/${start}/${end}`;
    const finalUrl = PROXY_URL ? `${PROXY_URL}?ship=${shipId}&start=${start}&end=${end}` : url;
    const response = await fetch(finalUrl);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  }

  function normalizeAvailability(apiResponse){
    const ships = apiResponse?.data?.ship || apiResponse?.datta?.ship || apiResponse?.ship || [];
    const shipArray = Array.isArray(ships) ? ships : [ships];

    return shipArray.flatMap(ship => {
      const itineraries = Array.isArray(ship?.itinerary) ? ship.itinerary : [];
      return itineraries.map(it => ({
        shipName: ship?.name || "Galápagos cruise",
        itineraryName: it?.name || "Custom",
        startDate: it?.date?.start || "",
        endDate: it?.date?.end || "",
        free: Number(it?.free ?? 0),
        hold: Number(it?.hold ?? 0),
        single: Number(it?.single ?? 0),
        price: Number(it?.price ?? 0),
        promoAmount: it?.promo?.amount ? Number(it.promo.amount) : null,
        promoNote: it?.promo?.observacion || "",
        cabins: Array.isArray(it?.cabin) ? it.cabin : []
      }));
    }).filter(item => item.startDate || item.endDate || item.shipName);
  }

  function renderResults(items){
    list.innerHTML = "";

    if (!items.length) {
      showResultsIntro(false);
      list.innerHTML = `
        <article class="availability-empty availability-empty--premium">
          <h3>No real-time availability found</h3>
          <p class="muted">Try another date range or request a custom quote. We can check alternatives manually with the cruise operator.</p>
          <a class="btn btn--accent" href="${buildWhatsappLink("Hello, I would like help finding a Galápagos cruise.")}" target="_blank" rel="noopener">Request by WhatsApp</a>
        </article>`;
      return;
    }

    showResultsIntro(true, items.length);

    items.forEach(item => {
      const card = document.createElement("article");
      card.className = "cruise-card cruise-card--premium";

      const finalPrice = item.promoAmount || item.price;
      const hasPromo = item.promoAmount && item.price && item.promoAmount < item.price;
      const nights = calculateNights(item.startDate, item.endDate);
      const image = getShipImage(item.shipName);
      const urgency = getUrgencyLabel(item.free);
      const shipName = escapeHTML(item.shipName);
      const itinerary = escapeHTML(item.itineraryName);
      const whatsappMessage = `Hello, I am interested in ${item.shipName} - Itinerary ${item.itineraryName}, departing ${formatDisplayDate(item.startDate)} and ending ${formatDisplayDate(item.endDate)}. Please send me full quote, inclusions and booking conditions.`;

      card.innerHTML = `
        <div class="cruise-card__image-wrap">
          <img class="cruise-card__image" src="${image}" alt="${shipName} Galápagos cruise" loading="lazy" onerror="this.src='../assets/img/destinations/galapagos.jpg'">
          <div class="cruise-card__overlay">
            <span class="ship-label">${shipName}</span>
            <span class="promo-tag promo-tag--float">${hasPromo ? "Promo" : "Live"}</span>
          </div>
        </div>

        <div class="cruise-card__content">
          <div class="cruise-card__title-row">
            <div>
              <p class="eyebrow">Galápagos cruise</p>
              <h3>Itinerary ${itinerary}</h3>
            </div>
            <span class="duration-pill">${nights ? `${nights + 1}D / ${nights}N` : "Dates set"}</span>
          </div>

          <div class="cruise-meta cruise-meta--premium">
            <span>📅 ${formatDisplayDate(item.startDate)} → ${formatDisplayDate(item.endDate)}</span>
            <span>🛏️ ${formatCabinText(item.free)}</span>
            <span>👤 ${formatSingleText(item.single)}</span>
          </div>

          <div class="availability-alert ${urgency.className}">${urgency.text}</div>

          <div class="cruise-price cruise-price--premium">
            ${item.price ? `<span class="price">From $${Number(finalPrice).toLocaleString("en-US")}</span>` : `<span class="price">Price on request</span>`}
            ${hasPromo ? `<small class="old-price">Before $${Number(item.price).toLocaleString("en-US")}</small>` : ""}
          </div>

          ${item.promoNote ? `<p class="muted promo-note">${escapeHTML(item.promoNote)}</p>` : `<p class="muted included-note">Includes guided excursions, meals on board and Galápagos cruise experience according to selected itinerary.</p>`}

          <details class="cabin-details cabin-details--premium">
            <summary>View cabin options</summary>
            ${renderCabins(item.cabins)}
          </details>

          <div class="card__footer card__footer--premium">
            <a class="btn btn--accent" href="${buildWhatsappLink(whatsappMessage)}" target="_blank" rel="noopener">Get quote now</a>
            <a class="link" href="contact.html#cotizar">Contact form →</a>
          </div>
        </div>`;

      list.appendChild(card);
    });
  }

  function showResultsIntro(show, count = 0){
    if (!resultsIntro) return;
    resultsIntro.hidden = !show;
    if (show) {
      resultsIntro.innerHTML = `
        <div>
          <p class="badge">Available departures</p>
          <h2>Handpicked options for your search</h2>
          <p class="lead">${count} result${count === 1 ? "" : "s"} found. Review the itinerary, cabins and live pricing, then request a confirmed quote by WhatsApp.</p>
        </div>`;
    }
  }

  function getShipImage(shipName){
    const normalized = String(shipName || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
    const found = SHIP_IMAGES.find(entry => entry.match.some(token => normalized.includes(token)));
    return found?.src || "../assets/img/destinations/galapagos.jpg";
  }

  function getUrgencyLabel(free){
    if (free <= 0) return { text: "Available on request", className: "is-neutral" };
    if (free <= 2) return { text: "High demand: very limited cabins", className: "is-hot" };
    if (free <= 6) return { text: "Limited cabins left", className: "is-good" };
    return { text: "Good availability for this date", className: "is-open" };
  }

  function formatCabinText(free){
    if (free <= 0) return "Availability on request";
    if (free === 1) return "Only 1 cabin left";
    return `Only ${free} cabins left`;
  }

  function formatSingleText(single){
    if (single <= 0) return "Singles on request";
    if (single === 1) return "1 single space available";
    return `${single} single spaces available`;
  }

  function calculateNights(start, end){
    if (!start || !end) return 0;
    const diff = Math.round((new Date(`${end}T00:00:00`) - new Date(`${start}T00:00:00`)) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  function renderCabins(cabins){
    if (!cabins.length) return `<p class="muted">Cabin details available on request.</p>`;

    return `<div class="cabin-list">${cabins.slice(0, 6).map(cabin => {
      const accom = Array.isArray(cabin?.accom) ? cabin.accom : [];
      const priceLine = accom.length ? accom.slice(0, 2).map(a => `${escapeHTML(a.name || "Accommodation")}: $${Number(a.promo || a.price || 0).toLocaleString("en-US")}`).join(" · ") : "Price on request";
      return `<div class="cabin-item"><strong>${escapeHTML(cabin.name || "Cabin")}</strong><span>${escapeHTML(cabin.deck || "Deck on request")}</span><small>${priceLine}</small></div>`;
    }).join("")}</div>`;
  }

  function formatDisplayDate(value){
    if (!value) return "Date on request";
    return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  }

  function buildWhatsappLink(message){
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  function escapeHTML(value){
    return String(value).replace(/[&<>'"]/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[ch]));
  }

  function showLoading(){
    showResultsIntro(false);
    list.innerHTML = `<article class="availability-empty availability-empty--premium"><h3>Searching real-time availability...</h3><p class="muted">Please wait while we check Galápagos cruise options.</p></article>`;
    showStatus("Connecting with the availability API...", "info");
  }

  function renderEmptyState(){
    showResultsIntro(false);
    list.innerHTML = `<article class="availability-empty availability-empty--premium"><h3>Search Galápagos cruise availability</h3><p class="muted">Select a cruise ship and date range to display real-time departures, cabins and prices.</p></article>`;
  }

  function renderError(){
    showResultsIntro(false);
    list.innerHTML = `<article class="availability-empty availability-empty--premium"><h3>API connection pending</h3><p class="muted">The page design is ready, but the API may need a secure backend proxy before launch.</p><a class="btn btn--accent" href="${buildWhatsappLink("Hello, I would like to check Galápagos cruise availability.")}" target="_blank" rel="noopener">Check by WhatsApp</a></article>`;
  }

  function showStatus(message, type = "info"){
    if (!status) return;
    status.textContent = message;
    status.dataset.status = type;
  }
})();
