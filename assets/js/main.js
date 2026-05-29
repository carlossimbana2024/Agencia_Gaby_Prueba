import { setYear } from "./utils.js";

// ==========================================
// CARRUSEL DE DESTINOS (INFINITO/LOOP)
// ==========================================
function initCarousel() {
  const carouselContainers = document.querySelectorAll('[data-carousel-container]');
  
  carouselContainers.forEach(container => {
    const name = container.getAttribute('data-carousel-container');
    const track = container.querySelector('.carousel__track');
    const dotsContainer = container.querySelector('[data-carousel-dots]');
    const prevBtn = document.querySelector(`[data-carousel="prev"]`);
    const nextBtn = document.querySelector(`[data-carousel="next"]`);
    
    if (!track) return;
    
    const items = track.querySelectorAll('.carousel__item');
    let currentIndex = 0;
    let itemsPerView = getItemsPerView();
    const totalItems = items.length;
    
    // Crear indicadores (dots) - Solo para items únicos
    if (dotsContainer) {
      items.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'carousel__dot' + (index === 0 ? ' is-active' : '');
        dot.setAttribute('data-index', index);
        
        dot.addEventListener('click', () => {
          currentIndex = index;
          updateCarousel();
        });
        
        dotsContainer.appendChild(dot);
      });
    }
    
    function getItemsPerView() {
      const width = window.innerWidth;
      if (width < 640) return 1;    // Mobile
      if (width < 1024) return 2;   // Tablet
      return 4;                     // Desktop
    }
    
    function updateCarousel() {
      // Calcular el offset con loop infinito
      const offset = -currentIndex * (100 / itemsPerView);
      track.style.transform = `translateX(${offset}%)`;
      
      // Actualizar dots - mostrar punto según posición en el loop
      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.carousel__dot');
        dots.forEach((dot, index) => {
          dot.classList.toggle('is-active', index === (currentIndex % totalItems));
        });
      }
    }
    
    // Botones de navegación con LOOP INFINITO
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        updateCarousel();
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalItems;
        updateCarousel();
      });
    }
    
    // Responsivo
    window.addEventListener('resize', debounce(() => {
      const newItemsPerView = getItemsPerView();
      if (newItemsPerView !== itemsPerView) {
        itemsPerView = newItemsPerView;
        updateCarousel();
      }
    }, 250));
    
    updateCarousel();
  });
}

// ==========================================
// PLAYLIST DE VIDEO HERO
// ==========================================
function initHeroVideoPlaylist() {
  const video = document.getElementById("heroVideo");
  if (!video) return;

  const videoPlaylist = [
    "assets/img/home/hero.mp4",
    "assets/img/home/hero2.mp4",
    "assets/img/home/hero3.mp4",
    "assets/img/home/hero4.mp4"
  ];

  let currentVideoIndex = 0;

  function playVideo(index) {
    video.src = videoPlaylist[index];
    video.load();
    const attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => {
        // Autoplay can be blocked in some browsers. The poster/overlay remains visible.
      });
    }
  }

  playVideo(currentVideoIndex);

  video.addEventListener("ended", () => {
    currentVideoIndex = (currentVideoIndex + 1) % videoPlaylist.length;
    playVideo(currentVideoIndex);
  });
}

// Función debounce para evitar múltiples llamadas
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

(function init() {
  setYear();
  initCarousel();
  initHeroVideoPlaylist();
})();