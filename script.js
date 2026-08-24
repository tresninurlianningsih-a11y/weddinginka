/* ==========================================================================
   UNDANGAN PERNIKAHAN DIGITAL ADAT BUGIS - INTERACTIVE JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initGuestName();
  initCountdown();
  initParticles();
  initScrollNav();
  initRSVPFeed();
});

/* --- 1. DYNAMIC GUEST NAME FROM URL PARAMETER --- */
function initGuestName() {
  const urlParams = new URLSearchParams(window.location.search);
  const guestParam = urlParams.get('to') || urlParams.get('tamu') || urlParams.get('guest');
  const guestDisplay = document.getElementById('guest-name-display');

  if (guestParam && guestDisplay) {
    // Replace plus signs or URL encoding with spaces
    const cleanGuestName = decodeURIComponent(guestParam.replace(/\+/g, ' '));
    guestDisplay.innerText = cleanGuestName;
  }
}

/* --- 2. ENVELOPE GATE & MUSIC AUTOPLAY --- */
const coverScreen = document.getElementById('cover-screen');
const mainContent = document.getElementById('main-content');
const openBtn = document.getElementById('open-invitation-btn');
const bgMusic = document.getElementById('bg-music');
const musicToggleBtn = document.getElementById('music-toggle-btn');

let isMusicPlaying = false;

if (openBtn) {
  openBtn.addEventListener('click', () => {
    // Play opening music
    playMusic();

    // Fade out cover screen with animation
    coverScreen.classList.add('fade-out');

    // Reveal main content
    mainContent.classList.remove('hidden-content');

    // Smooth scroll to top of main content
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Remove cover from layout after animation completes
    setTimeout(() => {
      coverScreen.style.display = 'none';
    }, 800);
  });
}

function playMusic() {
  if (bgMusic) {
    bgMusic.play().then(() => {
      isMusicPlaying = true;
      updateMusicButtonUI(true);
    }).catch(err => {
      console.log("Autoplay browser policy blocked audio, user must toggle manually:", err);
      updateMusicButtonUI(false);
    });
  }
}

function toggleMusic() {
  if (!bgMusic) return;

  if (isMusicPlaying) {
    bgMusic.pause();
    isMusicPlaying = false;
    updateMusicButtonUI(false);
  } else {
    bgMusic.play();
    isMusicPlaying = true;
    updateMusicButtonUI(true);
  }
}

function updateMusicButtonUI(playing) {
  const icon = musicToggleBtn.querySelector('i');
  if (playing) {
    icon.classList.remove('paused');
    musicToggleBtn.setAttribute('title', 'Hentikan Musik');
  } else {
    icon.classList.add('paused');
    musicToggleBtn.setAttribute('title', 'Putar Musik');
  }
}

if (musicToggleBtn) {
  musicToggleBtn.addEventListener('click', toggleMusic);
}

/* --- 3. COUNTDOWN TIMER --- */
function initCountdown() {
  // Target Event Date: 20 September 2026 09:00 WITA
  const eventDate = new Date('2026-09-20T09:00:00+08:00').getTime();

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function updateTimer() {
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance < 0) {
      if (daysEl) daysEl.innerText = "00";
      if (hoursEl) hoursEl.innerText = "00";
      if (minutesEl) minutesEl.innerText = "00";
      if (secondsEl) secondsEl.innerText = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.innerText = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.innerText = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.innerText = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.innerText = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* --- 4. COPY TO CLIPBOARD & TOAST NOTIFICATION --- */
function copyToClipboard(textToCopy, labelName) {
  navigator.clipboard.writeText(textToCopy).then(() => {
    showToast(`${labelName} berhasil disalin!`);
  }).catch(err => {
    console.error('Gagal menyalin:', err);
    // Fallback strategy for older browsers
    const tempInput = document.createElement('input');
    tempInput.value = textToCopy;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast(`${labelName} berhasil disalin!`);
  });
}

function showToast(message) {
  const toast = document.getElementById('toast-notification');
  const toastText = document.getElementById('toast-text');

  if (toast && toastText) {
    toastText.innerText = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

/* --- 5. GALLERY LIGHTBOX MODAL --- */
function openLightbox(imgSrc, captionText) {
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');

  if (modal && modalImg) {
    modal.style.display = 'flex';
    modalImg.src = imgSrc;
    if (caption) caption.innerText = captionText || '';
  }
}

function closeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Close lightbox on clicking outside image
window.addEventListener('click', (e) => {
  const modal = document.getElementById('lightbox-modal');
  if (e.target === modal) {
    closeLightbox();
  }
});

/* --- 6. RSVP FORM & LOCAL STORAGE FEED --- */
const STORAGE_KEY = 'bugis_wedding_wishes_inka';

function initRSVPFeed() {
  loadWishesFromStorage();
}

function submitRSVP(event) {
  event.preventDefault();

  const nameInput = document.getElementById('rsvp-name');
  const statusInput = document.getElementById('rsvp-status');
  const countInput = document.getElementById('rsvp-count');
  const messageInput = document.getElementById('rsvp-message');

  const name = nameInput.value.trim();
  const status = statusInput.value;
  const count = countInput.value;
  const message = messageInput.value.trim();

  if (!name || !status || !message) {
    showToast('Mohon lengkapi semua bidang form!');
    return;
  }

  const newWish = {
    id: Date.now(),
    name: name,
    status: status,
    count: count,
    message: message,
    time: 'Baru saja'
  };

  saveWishToStorage(newWish);
  renderWishItem(newWish, true);

  // Reset form
  document.getElementById('rsvp-form').reset();
  showToast('Terima kasih! Ucapan & Doa Anda telah terkirim.');
}

function saveWishToStorage(wish) {
  const currentWishes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  currentWishes.unshift(wish);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentWishes));
  updateWishCount(currentWishes.length + 3); // Include sample initial count
}

function loadWishesFromStorage() {
  const currentWishes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  currentWishes.forEach(wish => {
    renderWishItem(wish, false);
  });
  updateWishCount(currentWishes.length + 3);
}

function renderWishItem(wish, isNew = false) {
  const wishesList = document.getElementById('wishes-list');
  if (!wishesList) return;

  const wishDiv = document.createElement('div');
  wishDiv.className = 'wish-item';

  let statusClass = 'hadir';
  let statusIcon = '<i class="fa-solid fa-check"></i>';
  if (wish.status === 'Ragu-ragu') {
    statusClass = 'ragu';
    statusIcon = '<i class="fa-solid fa-clock"></i>';
  } else if (wish.status === 'Tidak Hadir') {
    statusClass = 'tidak-hadir';
    statusIcon = '<i class="fa-solid fa-xmark"></i>';
  }

  wishDiv.innerHTML = `
    <div class="wish-header">
      <strong>${escapeHtml(wish.name)}</strong>
      <span class="badge-status ${statusClass}">${statusIcon} ${escapeHtml(wish.status)}</span>
    </div>
    <p class="wish-text">${escapeHtml(wish.message)}</p>
    <small class="wish-time">${wish.time}</small>
  `;

  if (isNew) {
    wishesList.insertBefore(wishDiv, wishesList.firstChild);
  } else {
    wishesList.appendChild(wishDiv);
  }
}

function updateWishCount(count) {
  const countEl = document.getElementById('wish-count');
  if (countEl) {
    countEl.innerText = count;
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

/* --- 7. ACTIVE NAVIGATION ON SCROLL --- */
function initScrollNav() {
  const sections = document.querySelectorAll('section.section');
  const navItems = document.querySelectorAll('.nav-item');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  });
}

/* --- 8. GOLD PARTICLES DUST CANVAS BACKGROUND --- */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = 45;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.5 + 0.5,
      color: `rgba(249, 224, 118, ${Math.random() * 0.5 + 0.2})`,
      speedY: Math.random() * 0.5 + 0.1,
      speedX: (Math.random() - 0.5) * 0.3
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.y -= p.speedY;
      p.x += p.speedX;

      if (p.y < 0) p.y = height;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}
