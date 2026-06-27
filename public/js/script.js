/* ══════════════════════════
   SHARED NAV + FOOTER
   Direction 3 — Corporate Light
══════════════════════════ */

(function () {
  const NAV_HTML = `
<header id="mainNav">
  <div id="scroll-progress"></div>
  <div class="topbar">
    <div class="topbar-inner">
      <div class="topbar-left">
        <strong>IRE 2026</strong>
        <span class="topbar-dot"></span>
        3–4 July 2026
        <span class="topbar-dot"></span>
        HMDA Grounds, Necklace Road, Hyderabad
      </div>
      <div class="topbar-right">
        <a href="tel:+917981869954"><strong>+91 79818 69954</strong></a>
        <span class="topbar-sep">·</span>
        <a href="mailto:ireexpo2026@gmail.com">ireexpo2026@gmail.com</a>
        <span class="topbar-sep">·</span>
        <a href="contact.html">Contact</a>
      </div>
    </div>
  </div>
  <div class="main-navbar">
    <div>
      <a class="nav-logo" href="index.html">
        <div class="logo-mark">
          <span class="lm-win">WIN</span>
          <span class="lm-de">DE</span>
        </div>
        <div>
          <div class="logo-text-name">Dhan Enterprise</div>
          <div class="logo-text-tagline">Encompassing Energy Revolution</div>
        </div>
      </a>

      <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation" aria-expanded="false">
        <div class="hamburger">
          <span></span><span></span><span></span>
        </div>
      </button>

      <nav class="nav-links" id="navLinks" aria-label="Main navigation">
        <button class="nav-close" id="navClose" aria-label="Close navigation">✕</button>
        <a href="index.html" data-page="index">Home</a>
        <div class="nav-group">
          <span class="nav-btn" data-page="about">About ▾</span>
          <div class="nav-dropdown">
            <a href="about.html#story">About Us</a>
            <a href="about.html#team">Our Team</a>
            <a href="about.html#network">Global Network</a>
          </div>
        </div>
        <a href="services.html" data-page="services">Services</a>
        <div class="nav-group">
          <span class="nav-btn" data-page="ire"><span class="live-badge">LIVE</span> IRE 2026 ▾</span>
          <div class="nav-dropdown">
            <a href="ire.html">About IRE 2026</a>
            <a href="stalls-booking/index.html">Book a Stall</a>
            <a href="ire.html#sponsorship">Sponsorship</a>
            <a href="ire.html#floor-plan">Floor Plan</a>
          </div>
        </div>
        <div class="nav-group">
          <span class="nav-btn" data-page="trade">Trade ▾</span>
          <div class="nav-dropdown">
            <a href="trade.html#directory">Brand Data Bank</a>
            <a href="trade.html#network">Partner Network</a>
          </div>
        </div>
        <span class="nav-separator"></span>
        <div class="nav-ctas">
          <button id="themeToggle" class="btn-ghost" aria-label="Toggle Dark Mode" style="padding: 6px; display: flex; align-items: center; justify-content: center; border-radius: 50%; width: 36px; height: 36px;">
            <i data-lucide="moon"></i>
          </button>
          <a href="register.html" class="btn-ghost">Register</a>
          <a href="stalls-booking/index.html" class="btn-primary">Book a Stall →</a>
        </div>
      </nav>
    </div>
  </div>
</header>`;

  const FOOTER_HTML = `
<footer class="site-footer">
  <div class="footer-inner">
    <div>
      <div class="footer-brand-name">Dhan Enterprise</div>
      <div class="footer-brand-tag">Encompassing Energy Revolution</div>
      <p class="footer-brand-desc">10+ years of renewable energy consultancy — EV, Solar, BESS, Wind &amp; Green Hydrogen. Co-organising IRE 2026, India's premier clean energy expo.</p>
      <p class="footer-brand-est">WIN Dhan Enterprise · Est. 2014 · Hyderabad</p>
    </div>
    <div class="footer-col">
      <h5>Company</h5>
      <a href="about.html">About Us</a>
      <a href="services.html">Services</a>
      <a href="about.html#network">Global Network</a>
      <a href="contact.html">Contact</a>
    </div>
    <div class="footer-col">
      <h5>IRE 2026</h5>
      <a href="ire.html">About the Expo</a>
      <a href="stalls-booking/index.html">Book a Stall</a>
      <a href="ire.html#sponsorship">Sponsorship</a>
      <a href="ire.html#floor-plan">Floor Plan</a>
    </div>
    <div class="footer-col">
      <h5>Contact</h5>
      <a href="tel:+917981869954">+91 79818 69954</a>
      <a href="mailto:ireexpo2026@gmail.com">ireexpo2026@gmail.com</a>
      <a href="https://www.win-dhan.com" target="_blank" rel="noopener">www.win-dhan.com</a>
      <p>HMDA Grounds, Necklace Road,<br>Hyderabad, Telangana, India</p>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© 2026 WIN Dhan Enterprise. All rights reserved.</p>
    <p>Co-organised with Suprabha Trust · <a href="#" style="color:rgba(255,255,255,0.3);">Privacy</a></p>
  </div>
</footer>
<script src="https://unpkg.com/lucide@latest"></script>
<script>
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  } else {
    window.addEventListener('load', () => {
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  }
</script>`;

  // Inject nav
  const navTarget = document.getElementById('nav-placeholder');
  if (navTarget) navTarget.outerHTML = NAV_HTML;

  // Inject footer
  const footerTarget = document.getElementById('footer-placeholder');
  if (footerTarget) footerTarget.outerHTML = FOOTER_HTML;

  // Mark active nav link
  const page = document.body.dataset.page || '';
  document.querySelectorAll('[data-page]').forEach(el => {
    if (el.dataset.page === page || (page === 'tenders' && el.dataset.page === 'trade')) {
      el.classList.add('active');
    }
  });

  // Hamburger toggle
  const navToggle = document.getElementById('navToggle');
  const navClose  = document.getElementById('navClose');
  const navLinks  = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    const toggleMenu = (open) => {
      const isOpening = open !== undefined ? open : !navLinks.classList.contains('open');
      navLinks.classList.toggle('open', isOpening);
      navToggle.setAttribute('aria-expanded', isOpening);
      navToggle.classList.toggle('active', isOpening);
      document.body.style.overflow = isOpening ? 'hidden' : '';
      if (isOpening && navClose) navClose.focus();
      else if (!isOpening) navToggle.focus();
    };
    navToggle.addEventListener('click', () => toggleMenu());
    if (navClose) navClose.addEventListener('click', () => toggleMenu(false));
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !navToggle.contains(e.target)) toggleMenu(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) toggleMenu(false);
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => { if (window.innerWidth < 900) toggleMenu(false); });
    });
  }

  // Scroll: hide nav on scroll-down, show on scroll-up
  let lastY = window.scrollY;
  const nav = document.getElementById('mainNav');
  const mainNavbar = document.querySelector('.main-navbar');
  const scrollProg = document.getElementById('scroll-progress');
  
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    
    // Glassmorphism toggle
    if (mainNavbar) {
      if (y > 20) mainNavbar.classList.add('scrolled');
      else mainNavbar.classList.remove('scrolled');
    }
    
    // Scroll progress bar
    if (scrollProg) {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docH > 0 ? (y / docH) * 100 : 0;
      scrollProg.style.width = progress + '%';
    }
    
    if (!nav) return;
    if (navLinks && navLinks.classList.contains('open')) { lastY = y; return; }
    nav.style.transform = (y > lastY && y > 140) ? 'translateY(-100%)' : 'translateY(0)';
    lastY = y;
  }, { passive: true });
  
  // Dark Mode Toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = isDark ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
    
    themeToggle.addEventListener('click', () => {
      const currentDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (currentDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i data-lucide="moon"></i>';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i data-lucide="sun"></i>';
      }
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  }
})();

/* ── COUNTDOWN ── */
function startCountdown() {
  const target = new Date('2026-07-03T09:00:00+05:30');
  const ids = { days: 'cd-days', hrs: 'cd-hrs', min: 'cd-min', sec: 'cd-sec' };
  function tick() {
    const diff = target - new Date();
    if (diff <= 0) { return; }
    const d = Math.floor(diff / 864e5);
    const h = Math.floor((diff % 864e5) / 36e5);
    const m = Math.floor((diff % 36e5) / 6e4);
    const s = Math.floor((diff % 6e4) / 1e3);
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v).padStart(2, '0'); };
    set(ids.days, d); set(ids.hrs, h); set(ids.min, m); set(ids.sec, s);
  }
  tick();
  setInterval(tick, 1000);
}

/* ── SCROLL REVEAL & NUMBER ANIMATION ── */
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { 
      if (e.isIntersecting) { 
        e.target.classList.add('revealed'); 
        obs.unobserve(e.target); 
      } 
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  
  // Number counters
  const numObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const targetVal = parseInt(el.textContent.replace(/[^0-9]/g, ''));
        if (isNaN(targetVal)) return;
        let count = 0;
        const duration = 1500;
        const start = performance.now();
        const suffix = el.textContent.replace(/[0-9]/g, '');
        
        const updateCount = (timestamp) => {
          const progress = Math.min((timestamp - start) / duration, 1);
          // Ease out cubic
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(easeProgress * targetVal);
          el.textContent = current + suffix;
          if (progress < 1) requestAnimationFrame(updateCount);
          else el.textContent = targetVal + suffix;
        };
        requestAnimationFrame(updateCount);
        numObs.unobserve(el);
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.stat-val, .tier-price').forEach(el => numObs.observe(el));
}

/* ── FORM VALIDATION ── */
function validateContactForm(event) {
  event.preventDefault();
  const form = event.target;
  form.querySelectorAll('.err').forEach(e => e.remove());
  form.querySelectorAll('input,select,textarea').forEach(el => { el.style.borderColor = ''; el.style.boxShadow = ''; });
  let valid = true;
  function err(el, msg) {
    if (!el) return;
    valid = false;
    el.style.borderColor = '#c0392b';
    el.style.boxShadow = '0 0 0 3px rgba(192,57,43,0.10)';
    const d = document.createElement('div');
    d.className = 'err';
    d.style.cssText = 'color:#c0392b;font-size:11.5px;font-weight:600;margin-top:4px;';
    d.textContent = msg;
    el.parentNode.appendChild(d);
  }
  const name  = form.querySelector('#contactName');
  const phone = form.querySelector('#contactPhone');
  const email = form.querySelector('#contactEmail');
  const msg   = form.querySelector('#contactMessage');
  if (name  && !name.value.trim())  err(name,  'Full name is required');
  if (phone && !phone.value.trim()) err(phone, 'Phone number is required');
  if (email && !email.value.trim()) err(email, 'Email is required');
  else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) err(email, 'Enter a valid email');
  if (msg   && !msg.value.trim())   err(msg,   'Message is required');
  if (valid) {
    const s = document.createElement('div');
    s.style.cssText = 'background:#d4edda;color:#155724;border:1px solid #c3e6cb;padding:1rem 1.2rem;border-radius:8px;margin-bottom:1rem;font-size:14px;font-weight:600;';
    s.textContent = '✓ Message sent! We will get back to you shortly.';
    form.parentNode.insertBefore(s, form);
    form.reset();
    setTimeout(() => s.remove(), 5000);
  }
  return false;
}

/* ── TENDER FILTER ── */
function initTenderFilter() {
  document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.dataset.cat || 'all';
      document.querySelectorAll('.tender-row').forEach(row => {
        row.style.display = (cat === 'all' || row.dataset.cat === cat) ? '' : 'none';
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initTenderFilter();
  if (document.getElementById('cd-days')) startCountdown();
});
