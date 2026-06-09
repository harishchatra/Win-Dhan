/* ═══════════════════════════════════════════════════
   DHAN ENTERPRISE — Shared JavaScript
   Utilities: scroll reveal, nav scroll shadow,
              countdown, form validation, tender filter
═══════════════════════════════════════════════════ */

/* ── Scroll Reveal ── */
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.07 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ── Nav scroll shadow ── */
function initNavScroll() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ── Countdown timer ──
   target: ISO date string e.g. '2026-07-03T09:00:00'
   dayId/hrId/minId/secId: element IDs for the number spans */
function startCountdown(targetDate, dayId, hrId, minId, secId) {
  const target = new Date(targetDate);
  function tick() {
    const diff = Math.max(0, target - new Date());
    const d = Math.floor(diff / 864e5);
    const h = Math.floor((diff % 864e5) / 36e5);
    const m = Math.floor((diff % 36e5) / 6e4);
    const s = Math.floor((diff % 6e4) / 1e3);
    const pad = v => String(v).padStart(2, '0');
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = pad(val); };
    set(dayId, d); set(hrId, h); set(minId, m); set(secId, s);
  }
  tick();
  setInterval(tick, 1000);
}

/* ── Contact Form Validation ── */
function validateContactForm(event) {
  event.preventDefault();
  const nameEl   = document.getElementById('contactName');
  const phoneEl  = document.getElementById('contactPhone');
  const emailEl  = document.getElementById('contactEmail');
  const enquiryEl= document.getElementById('contactEnquiry');
  const msgEl    = document.getElementById('contactMessage');

  document.querySelectorAll('.form-err').forEach(e => e.remove());
  document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(el => {
    el.style.borderColor = ''; el.style.boxShadow = '';
  });

  let valid = true;
  function err(el, msg) {
    if (!el) return;
    valid = false;
    el.style.borderColor = '#c0392b';
    el.style.boxShadow = '0 0 0 3px rgba(192,57,43,0.1)';
    const d = document.createElement('div');
    d.className = 'form-err';
    d.style.cssText = 'color:#c0392b;font-size:.75rem;font-weight:600;margin-top:.3rem;';
    d.textContent = msg;
    el.parentNode.appendChild(d);
  }

  if (!nameEl?.value.trim())  err(nameEl, 'Full Name is required');

  const ph = /^\+?(\d{2})?[-. ]?([6-9]\d{9})$/;
  if (!phoneEl?.value.trim())             err(phoneEl, 'Phone number is required');
  else if (!ph.test(phoneEl.value.trim())) err(phoneEl, 'Enter a valid 10-digit mobile number');

  const em = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailEl?.value.trim())              err(emailEl, 'Email is required');
  else if (!em.test(emailEl.value.trim())) err(emailEl, 'Enter a valid email address');

  if (enquiryEl?.value === 'Select enquiry type') err(enquiryEl, 'Please select an enquiry type');
  if (!msgEl?.value.trim())                err(msgEl, 'Message is required');
  else if (msgEl.value.trim().length < 10) err(msgEl, 'Message must be at least 10 characters');

  if (valid) {
    const form = event.target;
    const success = document.createElement('div');
    success.style.cssText = 'background:#f0f7f2;color:#0d3320;border:1.5px solid #1e7a3c;padding:1rem 1.2rem;border-radius:10px;margin-bottom:1rem;font-size:.9rem;font-weight:600;';
    success.textContent = '✅ Thank you! Your message has been sent. We will get back to you shortly.';
    form.parentNode.insertBefore(success, form);
    form.reset();
    setTimeout(() => success.remove(), 5500);
  }
  return false;
}

/* ── Tender Filter Pills ── */
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

/* ── Active nav link highlight ── */
function setActiveNav() {
  const page = document.body.dataset.page || '';
  document.querySelectorAll('nav a[href]').forEach(a => {
    const href = a.getAttribute('href') || '';
    const pageName = href.replace('.html','').replace('#','').split('/').pop();
    if (pageName === page || (page === 'index' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ── Init on DOM ready ── */
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initNavScroll();
  initTenderFilter();
  setActiveNav();
});
