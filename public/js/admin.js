// ── IRE EXPO 2026 ADMIN DATABASE ENGINE & CONTROLLERS ──

const DB_USERS = 'ire_db_users';
const DB_STALLS = 'ire_db_stalls';
const DB_LEADS = 'ire_db_leads';
const DB_EXHIBITORS = 'ire_db_exhibitors';
const DB_PAYMENTS = 'ire_db_payments';
const DB_VENUE = 'ire_db_venue';

// Phase 2 Collections keys
const DB_VISITORS = 'ire_db_visitors';
const DB_SPONSORS = 'ire_db_sponsors';
const DB_AGENDA = 'ire_db_agenda';
const DB_SPEAKERS = 'ire_db_speakers';
const DB_CAMPAIGNS = 'ire_db_campaigns';
const DB_INQUIRIES = 'ire_db_inquiries';
const DB_GALLERY = 'ire_db_gallery';
const DB_NOTIFS = 'ire_db_notifications';
const AUDIT_LOGS_KEY = 'ire_audit_logs';

// Settings keys
const SETTING_REG_OPEN = 'ire_reg_open';
const SETTING_REG_LIMIT = 'ire_reg_limit';
const SETTING_REG_APPROVAL = 'ire_reg_approval';
const SETTING_REG_QR = 'ire_reg_qr';
const SETTING_REG_EMAIL = 'ire_reg_email';

// Global dataset state
let db = {
  users: [],
  stalls: [],
  leads: [],
  exhibitors: [],
  payments: [],
  venue: {},
  visitors: [],
  sponsors: [],
  sponsor_applications: [],
  agenda: [],
  speakers: [],
  campaigns: [],
  inquiries: [],
  gallery: [],
  notifications: []
};

let activeRole = 'super_admin';
let currentActiveView = 'dashboard';
let adminMapScale = 1;

// ── INITIALIZATION ENGINE ──
document.addEventListener('DOMContentLoaded', () => {
  initAdminUI();
});

async function syncRamData() {
  try {
    const [stalls, leads, exhibitors, payments, visitors, sponsors, sponsorApps, agenda, speakers, campaigns, inquiries, gallery, notifications, venue, settings] = await Promise.all([
      fetch('/api/stalls').then(r => r.json()),
      fetch('/api/leads').then(r => r.json()),
      fetch('/api/exhibitors').then(r => r.json()),
      fetch('/api/payments').then(r => r.json()),
      fetch('/api/visitors').then(r => r.json()),
      fetch('/api/sponsors').then(r => r.json()),
      fetch('/api/sponsor_applications').then(r => r.json()),
      fetch('/api/agenda').then(r => r.json()),
      fetch('/api/speakers').then(r => r.json()),
      fetch('/api/campaigns').then(r => r.json()),
      fetch('/api/inquiries').then(r => r.json()),
      fetch('/api/gallery').then(r => r.json()),
      fetch('/api/automation_logs').then(r => r.json()),
      fetch('/api/venue').then(r => r.json()),
      fetch('/api/settings').then(r => r.json())
    ]);

    db.stalls = stalls;
    db.leads = leads;
    db.exhibitors = exhibitors;
    db.payments = payments;
    db.visitors = visitors;
    db.sponsors = sponsors;
    db.sponsor_applications = sponsorApps;
    db.agenda = agenda;
    db.speakers = speakers;
    db.campaigns = campaigns;
    db.inquiries = inquiries;
    db.gallery = gallery;
    
    // Map notifications to display properly
    db.notifications = notifications.map(n => ({
      id: n.id,
      message: n.message_body || `${n.type.toUpperCase()}: ${n.trigger_event} to ${n.recipient}`,
      type: n.type === 'email' ? 'success' : 'info',
      time: n.timestamp.split('T')[1]?.slice(0, 5) || 'Now',
      read: true
    }));
    
    db.venue = venue;
    db.settings = settings;
  } catch (err) {
    console.error('Error syncing backend database:', err);
  }
}

async function commitLocalDatabase(collectionKey, data) {
  let endpoint = '';
  if (collectionKey === DB_LEADS) endpoint = '/api/leads';
  else if (collectionKey === DB_EXHIBITORS) endpoint = '/api/exhibitors';
  else if (collectionKey === DB_STALLS) endpoint = '/api/stalls';
  else if (collectionKey === DB_PAYMENTS) endpoint = '/api/payments';
  else if (collectionKey === DB_VISITORS) endpoint = '/api/visitors';
  else if (collectionKey === DB_SPONSORS) endpoint = '/api/sponsors';
  else if (collectionKey === DB_AGENDA) endpoint = '/api/agenda';
  else if (collectionKey === DB_SPEAKERS) endpoint = '/api/speakers';
  else if (collectionKey === DB_CAMPAIGNS) endpoint = '/api/campaigns';
  else if (collectionKey === DB_INQUIRIES) endpoint = '/api/inquiries';
  else if (collectionKey === DB_GALLERY) endpoint = '/api/gallery';

  if (!endpoint) {
    localStorage.setItem(collectionKey, JSON.stringify(data));
    await syncRamData();
    refreshDashboardMetrics();
    return;
  }

  const keyMap = {
    [DB_LEADS]: 'leads',
    [DB_EXHIBITORS]: 'exhibitors',
    [DB_STALLS]: 'stalls',
    [DB_PAYMENTS]: 'payments',
    [DB_VISITORS]: 'visitors',
    [DB_SPONSORS]: 'sponsors',
    [DB_AGENDA]: 'agenda',
    [DB_SPEAKERS]: 'speakers',
    [DB_CAMPAIGNS]: 'campaigns',
    [DB_INQUIRIES]: 'inquiries',
    [DB_GALLERY]: 'gallery'
  };

  const dbKey = keyMap[collectionKey];
  const oldList = db[dbKey] || [];

  try {
    if (data.length > oldList.length) {
      const addedItem = data.find(item => !oldList.some(old => old.id === item.id));
      if (addedItem) {
        let url = endpoint;
        let method = 'POST';
        if (collectionKey === DB_VISITORS) {
          url = '/api/visitors/register';
        }
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addedItem)
        });
        if (!res.ok) throw new Error('Failed to create item on server');
      }
    } else if (data.length < oldList.length) {
      const deletedItem = oldList.find(old => !data.some(item => item.id === old.id));
      if (deletedItem) {
        const res = await fetch(`${endpoint}/${deletedItem.id}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete item on server');
      }
    } else {
      const modifiedItem = data.find(item => {
        const old = oldList.find(o => o.id === item.id);
        return old && JSON.stringify(old) !== JSON.stringify(item);
      });
      if (modifiedItem) {
        let url = `${endpoint}/${modifiedItem.id}`;
        let method = 'PUT';
        let body = modifiedItem;

        if (collectionKey === DB_VISITORS) {
          const oldVal = oldList.find(o => o.id === modifiedItem.id);
          if (oldVal && oldVal.status !== 'checked_in' && modifiedItem.status === 'checked_in') {
            url = `/api/visitors/${modifiedItem.id}/checkin`;
            body = {};
          } else {
            url = ''; // Skip other visitor edits
          }
        }

        if (url) {
          const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          if (!res.ok) throw new Error('Failed to update item on server');
        }
      }
    }
  } catch (err) {
    console.error('API Sync Error:', err);
    showToast('⚠️ Sync failed: ' + err.message);
  }

  await syncRamData();
  refreshDashboardMetrics();
}

// ── AUDIT LOG GENERATOR ──
function logActivity(message) {
  let logs = JSON.parse(localStorage.getItem(AUDIT_LOGS_KEY)) || [];
  const newLog = {
    id: 'log-' + Date.now(),
    message: message,
    time: new Date().toLocaleTimeString() + ' | ' + new Date().toLocaleDateString(),
    timestamp: Date.now()
  };
  logs.unshift(newLog);
  localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs.slice(0, 50)));
  renderAuditLogs();
}

function renderAuditLogs() {
  const logs = JSON.parse(localStorage.getItem(AUDIT_LOGS_KEY)) || [];
  const container = document.getElementById('audit-logs-list');
  if (!container) return;
  
  if (logs.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding: 2rem; color: var(--text-muted); font-size:0.75rem;">No activity logs recorded.</div>';
    return;
  }
  
  container.innerHTML = logs.map(log => `
    <div class="activity-item">
      <div class="activity-icon">⚙️</div>
      <div class="activity-details">
        <div class="activity-msg">${log.message}</div>
        <div class="activity-time">${log.time}</div>
      </div>
    </div>
  `).join('');
}


// ── NOTIFICATION CENTER CONTROLLERS ──
function triggerNotification(message, type = 'success') {
  let notifs = JSON.parse(localStorage.getItem(DB_NOTIFS)) || [];
  const newNotif = {
    id: 'notif-' + Date.now(),
    message: message,
    type: type,
    time: new Date().toLocaleTimeString(),
    read: false
  };
  notifs.unshift(newNotif);
  localStorage.setItem(DB_NOTIFS, JSON.stringify(notifs));
  syncRamData();
  renderNotificationsTray();
}

function renderNotificationsTray() {
  const tray = document.getElementById('notif-tray-list');
  const badge = document.getElementById('notif-bell-badge');
  if (!tray || !badge) return;

  const unreadCount = db.notifications.filter(n => !n.read).length;
  badge.textContent = unreadCount;
  badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';

  if (db.notifications.length === 0) {
    tray.innerHTML = '<div style="padding:15px; font-size:0.72rem; color:var(--text-muted); text-align:center;">No notifications logged.</div>';
    return;
  }

  tray.innerHTML = db.notifications.slice(0, 5).map(n => `
    <div class="notif-tray-item ${n.read ? 'read' : ''}" onclick="markNotifRead('${n.id}')">
      <span class="ico">${n.type === 'success' ? '🟢' : n.type === 'warning' ? '🟡' : '🔵'}</span>
      <div style="flex:1;">
        <div class="msg">${n.message}</div>
        <div class="time">${n.time}</div>
      </div>
    </div>
  `).join('');
}

function markNotifRead(id) {
  const idx = db.notifications.findIndex(n => n.id === id);
  if (idx !== -1) {
    db.notifications[idx].read = true;
    commitLocalDatabase(DB_NOTIFS, db.notifications);
    renderNotificationsTray();
  }
}

function clearAllNotifications() {
  localStorage.setItem(DB_NOTIFS, JSON.stringify([]));
  syncRamData();
  renderNotificationsTray();
  showToast('🧹 Notifications cleared.');
}

function toggleNotifTray(e) {
  e.stopPropagation();
  const dropdown = document.getElementById('notif-center-dropdown');
  if (dropdown.style.display === 'block') {
    dropdown.style.display = 'none';
  } else {
    dropdown.style.display = 'block';
    // close search
    document.getElementById('global-search-dropdown').style.display = 'none';
  }
}

// Close dropdowns on document click
document.addEventListener('click', () => {
  const notifDrop = document.getElementById('notif-center-dropdown');
  if (notifDrop) notifDrop.style.display = 'none';
  const searchDrop = document.getElementById('global-search-dropdown');
  if (searchDrop) searchDrop.style.display = 'none';
});


// ── USER ROLE & PERMISSION SWITCHER ──
async function initAdminUI() {
  let user = null;
  try {
    const res = await fetch('/api/auth/session', { cache: 'no-store' });
    if (!res.ok) {
      window.location.href = '/login.html';
      return;
    }
    const data = await res.json();
    if (!data.success) {
      window.location.href = '/login.html';
      return;
    }
    user = data.user;
  } catch (err) {
    console.error('Session verification network error:', err);
    window.location.href = '/login.html';
    return;
  }

  // Authentication succeeded, load and render UI elements
  try {
    activeRole = user.role;
    const userName = user.name;

    // Update avatar badge
    const avatar = document.getElementById('user-profile-avatar');
    if (avatar) {
      const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      avatar.textContent = initials;
      avatar.title = `${userName} (${activeRole.replace('_', ' ').toUpperCase()})`;
    }

    // Update role label display
    const roleDisplay = document.getElementById('session-role-display');
    if (roleDisplay) {
      roleDisplay.textContent = activeRole.replace('_', ' ').replace('-', ' ').toUpperCase();
    }

    applyRolePermissions();

    // Load initial elements
    refreshDashboardMetrics();
    renderStallsTable();
    renderAdminMapSVG();
    renderLeadsTable();
    renderExhibitorsTable();
    renderPaymentsTable();
    populateVenueForm();
    renderUploadedMapsList();
    renderAuditLogs();

    // Phase 2 components
    renderVisitorsTable();
    renderSponsorsTable();
    renderAgendaList();
    renderSpeakersList();
    populateSessionSpeakerDropdown();
    renderCampaignsList();
    renderInquiriesTable();
    populateInquirySalesExecDropdown();
    renderDocumentsRepository();
    renderMediaGalleryGrid();
    populateContentEditorForm();
    populateRegSettingsForm();
    renderNotificationsTray();
  } catch (err) {
    console.error('UI Rendering Error (Authentication is valid):', err);
    // DO NOT REDIRECT to login.html to prevent infinite loops and allow debugging!
  }
}

async function handleLogout() {
  try {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (res.ok) {
      window.location.href = '/login.html';
    }
  } catch (err) {
    console.error('Logout error:', err);
    showToast('❌ Failed to log out');
  }
}

function applyRolePermissions() {
  const btnCreateStall = document.getElementById('btn-create-stall-trigger');
  const navPay = document.getElementById('nav-btn-payments');
  const btnSaveVenue = document.getElementById('btn-save-venue-trigger');
  const btnAddSponsor = document.getElementById('btn-add-sponsor-trigger');
  const btnCreateSession = document.getElementById('btn-create-session-trigger');
  const btnAddSpeaker = document.getElementById('btn-add-speaker-trigger');
  const settingsTab = document.getElementById('nav-btn-settings');

  // Reset
  if (btnCreateStall) btnCreateStall.style.display = 'inline-flex';
  if (navPay) navPay.style.display = 'flex';
  if (btnSaveVenue) btnSaveVenue.style.display = 'inline-flex';
  if (btnAddSponsor) btnAddSponsor.style.display = 'inline-flex';
  if (btnCreateSession) btnCreateSession.style.display = 'inline-flex';
  if (btnAddSpeaker) btnAddSpeaker.style.display = 'inline-flex';
  if (settingsTab) settingsTab.style.display = 'flex';

  if (activeRole === 'sales_executive') {
    if (btnCreateStall) btnCreateStall.style.display = 'none';
    if (navPay) navPay.style.display = 'none'; // Sales executives cannot access Payments ledger
    if (btnSaveVenue) btnSaveVenue.style.display = 'none';
    if (btnAddSponsor) btnAddSponsor.style.display = 'none';
    if (btnCreateSession) btnCreateSession.style.display = 'none';
    if (btnAddSpeaker) btnAddSpeaker.style.display = 'none';
    if (settingsTab) settingsTab.style.display = 'none'; // Cannot edit settings
  } else if (activeRole === 'admin') {
    if (btnCreateStall) btnCreateStall.style.display = 'none';
    if (btnSaveVenue) btnSaveVenue.style.display = 'none';
    if (settingsTab) settingsTab.style.display = 'none';
  }

  // Refresh tables
  renderStallsTable();
  renderLeadsTable();
  renderExhibitorsTable();
  renderPaymentsTable();
  renderVisitorsTable();
  renderSponsorsTable();
  renderAgendaList();
  renderInquiriesTable();

  // If page access blocked, revert to dashboard
  if (activeRole === 'sales_executive' && (currentActiveView === 'payments' || currentActiveView === 'settings')) {
    switchView('dashboard', document.querySelector('.sidebar-menu-btn'));
  }
}


// ── DASHBOARD COUNTERS & ANALYTICS CHARTS ──
function refreshDashboardMetrics() {
  syncRamData();

  const totalStalls = db.stalls.length;
  const bookedStalls = db.stalls.filter(s => s.status === 'sold').length;
  const reservedStalls = db.stalls.filter(s => s.status === 'reserved').length;
  const pendingStalls = db.stalls.filter(s => s.status === 'payment_pending').length;
  const availableStalls = db.stalls.filter(s => s.status === 'available').length;

  document.getElementById('kpi-stalls-status').textContent = `${bookedStalls} / ${totalStalls}`;
  document.getElementById('kpi-stalls-available').textContent = availableStalls;
  document.getElementById('kpi-stalls-reserved').textContent = `${reservedStalls} Reserved | ${pendingStalls} Pending`;

  let totalExpected = 0;
  let totalPaid = 0;
  let totalPending = 0;

  db.payments.forEach(p => {
    totalExpected += p.amount;
    totalPaid += p.paid / 1.18;
    totalPending += p.pending / 1.18;
  });

  // Include sponsors revenue in expected calculations
  let sponsorRev = 0;
  db.sponsors.forEach(s => {
    if (s.status === 'paid' || s.status === 'confirmed') {
      sponsorRev += s.amount;
    }
  });

  const grandCollectedBase = totalPaid + sponsorRev;
  document.getElementById('kpi-revenue-collected').textContent = `₹${((grandCollectedBase) / 100000).toFixed(2)}L`;
  document.getElementById('kpi-revenue-total').textContent = `Booth: ₹${(totalPaid/100000).toFixed(1)}L | Sponsor: ₹${(sponsorRev/100000).toFixed(1)}L`;

  const totalLeads = db.leads.length;
  const confirmedLeads = db.leads.filter(l => l.status === 'confirmed').length;
  const interestedLeads = db.leads.filter(l => l.status === 'interested' || l.status === 'negotiation' || l.status === 'proposal_sent').length;

  document.getElementById('kpi-leads-count').textContent = `${confirmedLeads} / ${totalLeads}`;
  document.getElementById('kpi-exhibitors-count').textContent = `${interestedLeads} Interested Leads`;

  // Draw Charts
  renderDonutChart(availableStalls, reservedStalls, pendingStalls, bookedStalls);
  renderRevenueProgress(totalPaid, totalPending, totalExpected);
  renderLeadsFunnel();

  // Phase 2 Charts
  renderVisitorRegistrationTrendChart();
  renderSponsorRevenueProgressChart();
  renderCategoryOccupancyPieChart();
}

function renderDonutChart(avail, res, pend, sold) {
  const total = avail + res + pend + sold;
  document.getElementById('donut-center-num').textContent = total;

  const legendAvail = document.getElementById('legend-count-available');
  const legendRes = document.getElementById('legend-count-reserved');
  const legendPend = document.getElementById('legend-count-pending');
  const legendSold = document.getElementById('legend-count-sold');

  if (legendAvail) legendAvail.textContent = avail;
  if (legendRes) legendRes.textContent = res;
  if (legendPend) legendPend.textContent = pend;
  if (legendSold) legendSold.textContent = sold;

  const svg = document.getElementById('dashboard-donut-svg');
  if (!svg) return;

  svg.querySelectorAll('.dynamic-segment').forEach(el => el.remove());

  const r = 50;
  const c = 2 * Math.PI * r; // 314.15
  
  const shares = [
    { val: sold, color: 'var(--status-sold)' },
    { val: pend, color: 'var(--status-pending)' },
    { val: res, color: 'var(--status-reserved)' },
    { val: avail, color: 'var(--status-available)' }
  ];

  let currentOffset = 0;
  shares.forEach(share => {
    if (share.val === 0) return;
    const pct = (share.val / total) * c;
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', 'donut-segment dynamic-segment');
    circle.setAttribute('cx', '70');
    circle.setAttribute('cy', '70');
    circle.setAttribute('r', String(r));
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', share.color);
    circle.setAttribute('stroke-width', '16');
    circle.setAttribute('stroke-dasharray', `${pct} ${c - pct}`);
    circle.setAttribute('stroke-dashoffset', String(-currentOffset));
    
    svg.appendChild(circle);
    currentOffset += pct;
  });
}

function renderRevenueProgress(paid, pending, total) {
  const pctPaid = total > 0 ? (paid / total) * 100 : 0;
  const pctPending = total > 0 ? (pending / total) * 100 : 0;

  document.getElementById('progress-val-collected').textContent = `₹${(paid / 100000).toFixed(2)} Lakhs (${pctPaid.toFixed(1)}%)`;
  document.getElementById('progress-val-pending').textContent = `₹${(pending / 100000).toFixed(2)} Lakhs (${pctPending.toFixed(1)}%)`;

  document.getElementById('progress-fill-collected').style.width = pctPaid + '%';
  document.getElementById('progress-fill-pending').style.width = pctPending + '%';

  const totalGross = paid + pending;
  document.getElementById('ledger-kpi-total').textContent = `₹${(totalGross * 1.18).toLocaleString('en-IN', {maximumFractionDigits:0})}`;
  document.getElementById('ledger-kpi-collected').textContent = `₹${(paid * 1.18).toLocaleString('en-IN', {maximumFractionDigits:0})}`;
  document.getElementById('ledger-kpi-pending').textContent = `₹${(pending * 1.18).toLocaleString('en-IN', {maximumFractionDigits:0})}`;
}

function renderLeadsFunnel() {
  const container = document.getElementById('leads-funnel-container');
  if (!container) return;

  const statuses = ['new', 'contacted', 'interested', 'proposal_sent', 'negotiation', 'confirmed', 'lost'];
  const counts = {};
  statuses.forEach(s => counts[s] = 0);

  db.leads.forEach(l => {
    if (counts[l.status] !== undefined) counts[l.status]++;
  });

  const max = Math.max(...Object.values(counts), 1);

  container.innerHTML = statuses.map(s => {
    const widthPct = (counts[s] / max) * 100;
    const displayName = s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ');
    return `
      <div class="funnel-stage">
        <div class="funnel-label">${displayName}</div>
        <div class="funnel-bar-track">
          <div class="funnel-bar-fill" style="width: ${widthPct}%; min-width: 25px;">
            ${counts[s]}
          </div>
        </div>
      </div>
    `;
  }).join('');
}


// ── PHASE 2 ADVANCED ANALYTICS CHARTS GENERATORS ──
function renderVisitorRegistrationTrendChart() {
  const svg = document.getElementById('chart-visitor-trend');
  if (!svg) return;

  // Let's draw an SVG line chart based on registration dates
  const dates = {};
  // last 5 days
  for (let i = 4; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dates[dateStr] = 0;
  }

  // Populate actual visitors count
  db.visitors.forEach(v => {
    if (dates[v.reg_date] !== undefined) dates[v.reg_date]++;
  });

  const values = Object.values(dates);
  const labels = Object.keys(dates).map(d => d.slice(5)); // MM-DD
  const maxVal = Math.max(...values, 4);

  // SVG dimensions: 320x120
  const width = 320;
  const height = 120;
  const padding = 20;

  let points = '';
  let gridLines = '';
  let textLabels = '';

  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  values.forEach((val, i) => {
    const x = padding + (i / (values.length - 1)) * chartWidth;
    const y = padding + chartHeight - (val / maxVal) * chartHeight;
    points += `${x},${y} `;

    // Circles at points
    textLabels += `<circle cx="${x}" cy="${y}" r="4" fill="var(--copper)"/>`;
    textLabels += `<text x="${x}" y="${y - 8}" font-size="8px" font-weight="700" fill="var(--text)" text-anchor="middle">${val}</text>`;
    // X Label
    textLabels += `<text x="${x}" y="${height - 4}" font-size="7px" font-weight="700" fill="var(--text-muted)" text-anchor="middle">${labels[i]}</text>`;
  });

  svg.innerHTML = `
    <!-- Grid borders -->
    <rect x="${padding}" y="${padding}" width="${chartWidth}" height="${chartHeight}" fill="none" stroke="rgba(0,0,0,0.04)" stroke-width="1"/>
    <!-- Line path -->
    <polyline fill="none" stroke="var(--copper)" stroke-width="2.5" points="${points.trim()}"/>
    <!-- Dots and labels -->
    ${textLabels}
  `;
}

function renderSponsorRevenueProgressChart() {
  const svg = document.getElementById('chart-sponsor-progress');
  if (!svg) return;

  // We want to render a vertical bar chart of revenues by sponsor tier
  const tiers = {
    'Title Sponsor': 0,
    'Platinum': 0,
    'Gold': 0,
    'Silver': 0,
    'Partner Tiers': 0
  };

  db.sponsors.forEach(s => {
    if (s.status === 'confirmed' || s.status === 'paid') {
      if (tiers[s.type] !== undefined) {
        tiers[s.type] += s.amount;
      } else {
        tiers['Partner Tiers'] += s.amount;
      }
    }
  });

  const values = Object.values(tiers);
  const labels = Object.keys(tiers);
  const maxVal = Math.max(...values, 100000);

  // SVG layout 320x120
  const width = 320;
  const height = 120;
  const padding = 20;

  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;
  const barWidth = (chartWidth / values.length) - 10;

  let barsHTML = '';

  values.forEach((val, i) => {
    const barHeight = (val / maxVal) * chartHeight;
    const x = padding + i * (chartWidth / values.length) + 5;
    const y = padding + chartHeight - barHeight;

    barsHTML += `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="url(#sponsor-bar-grad)" rx="2"/>
      <text x="${x + barWidth / 2}" y="${y - 4}" font-size="7px" font-weight="800" fill="var(--copper-dk)" text-anchor="middle">₹${(val / 100000).toFixed(1)}L</text>
      <text x="${x + barWidth / 2}" y="${height - 4}" font-size="6px" font-weight="700" fill="var(--text-dim)" text-anchor="middle">${labels[i].slice(0, 8)}..</text>
    `;
  });

  svg.innerHTML = `
    <defs>
      <linearGradient id="sponsor-bar-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="var(--gold-lt)"/>
        <stop offset="100%" stop-color="var(--copper)"/>
      </linearGradient>
    </defs>
    <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="var(--border)" stroke-width="1.5"/>
    ${barsHTML}
  `;
}

function renderCategoryOccupancyPieChart() {
  const svg = document.getElementById('chart-category-occupancy');
  if (!svg) return;

  // Pie chart of category-wise stall occupancy
  const categories = {
    'Gold': 0,
    'Diamond': 0,
    'Standard': 0,
    'VIP': 0
  };

  db.stalls.forEach(s => {
    if (s.status === 'sold') {
      if (categories[s.category] !== undefined) categories[s.category]++;
    }
  });

  const totalSold = Object.values(categories).reduce((a, b) => a + b, 0);
  if (totalSold === 0) {
    svg.innerHTML = '<text x="70" y="75" font-size="9px" text-anchor="middle" fill="var(--text-muted)">No bookings sold yet.</text>';
    return;
  }

  // Draw SVG segments circles in a 140x140 area
  svg.querySelectorAll('.dynamic-pie').forEach(el => el.remove());
  
  const r = 45;
  const c = 2 * Math.PI * r; // 282.74
  const colors = {
    'Gold': 'var(--color-block-a)',
    'Diamond': 'var(--color-block-d)',
    'Standard': 'var(--color-block-b)',
    'VIP': 'var(--color-block-e-vip)'
  };

  let currentOffset = 0;
  Object.keys(categories).forEach(cat => {
    const count = categories[cat];
    if (count === 0) return;
    const pct = (count / totalSold) * c;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', 'donut-segment dynamic-pie');
    circle.setAttribute('cx', '70');
    circle.setAttribute('cy', '70');
    circle.setAttribute('r', String(r));
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', colors[cat] || 'var(--silver)');
    circle.setAttribute('stroke-width', '16');
    circle.setAttribute('stroke-dasharray', `${pct} ${c - pct}`);
    circle.setAttribute('stroke-dashoffset', String(-currentOffset));
    
    svg.appendChild(circle);
    currentOffset += pct;
  });

  document.getElementById('pie-center-num').textContent = totalSold;
}


// ── VISITOR MANAGEMENT & QR PASS ENGINE ──
function renderVisitorsTable() {
  const tbody = document.getElementById('visitors-table-body');
  if (!tbody) return;

  const filterType = document.getElementById('visitor-filter-type').value;
  const filterStatus = document.getElementById('visitor-filter-status').value;
  const searchQuery = document.getElementById('visitor-search-query').value.toLowerCase().trim();

  let filtered = db.visitors;

  if (filterType) filtered = filtered.filter(v => v.type === filterType);
  if (filterStatus) filtered = filtered.filter(v => v.status === filterStatus);
  if (searchQuery) {
    filtered = filtered.filter(v => 
      v.name.toLowerCase().includes(searchQuery) ||
      v.company.toLowerCase().includes(searchQuery) ||
      v.email.toLowerCase().includes(searchQuery) ||
      v.phone.includes(searchQuery)
    );
  }

  document.getElementById('visitor-table-count').textContent = `${filtered.length} Visitors matching`;

  // Render stats
  const registeredCount = db.visitors.length;
  const checkedInCount = db.visitors.filter(v => v.status === 'checked_in').length;
  const attendancePct = registeredCount > 0 ? ((checkedInCount / registeredCount) * 100).toFixed(0) : 0;

  document.getElementById('v-kpi-registered').textContent = registeredCount;
  document.getElementById('v-kpi-checkedin').textContent = checkedInCount;
  document.getElementById('v-kpi-attendance').textContent = `${attendancePct}%`;

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 2rem; color:var(--text-muted);">No visitors registered matching criteria.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(v => {
    let statClass = 'available';
    if (v.status === 'checked_in') statClass = 'available';
    else if (v.status === 'registered') statClass = 'pending';
    else if (v.status === 'cancelled') statClass = 'sold';

    const renderActions = activeRole === 'sales_executive' ? `
      <button class="btn-table-icon" onclick="showVisitorQRPass('${v.id}')" title="View Ticket Pass">🎟️</button>
    ` : `
      <button class="btn-table-icon" onclick="showVisitorQRPass('${v.id}')" title="View Ticket Pass">🎟️</button>
      <button class="btn-table-icon" onclick="openVisitorModal('${v.id}')" title="Edit Visitor">✏️</button>
      ${v.status === 'registered' ? `<button class="btn-table-icon" style="color:var(--status-available);" onclick="quickCheckInVisitor('${v.id}')" title="Check-In Attendance">✓</button>` : ''}
      <button class="btn-table-icon danger" onclick="deleteVisitorRecord('${v.id}')" title="Delete Visitor">🗑️</button>
    `;

    return `
      <tr>
        <td><strong>${v.id}</strong></td>
        <td><strong>${v.name}</strong><br><span style="font-size:0.65rem; color:var(--text-muted);">${v.designation}</span></td>
        <td>${v.company}</td>
        <td><a href="tel:${v.phone}">${v.phone}</a><br><a href="mailto:${v.email}" style="font-size:0.7rem; color:var(--text-muted);">${v.email}</a></td>
        <td>${v.city}, ${v.state}</td>
        <td><span class="tag-pill" style="font-size:9.5px; font-weight:700;">${v.type}</span></td>
        <td><span class="status-badge ${statClass}">${v.status.replace('_', ' ')}</span></td>
        <td><div class="table-actions">${renderActions}</div></td>
      </tr>
    `;
  }).join('');
}

function openVisitorModal(visitorId) {
  const modal = document.getElementById('modal-visitor');
  const form = document.getElementById('visitor-modal-form');
  const title = document.getElementById('visitor-modal-title');
  const hiddenId = document.getElementById('visitor-modal-id-hidden');

  const inName = document.getElementById('v-name-input');
  const inPhone = document.getElementById('v-phone-input');
  const inEmail = document.getElementById('v-email-input');
  const inCompany = document.getElementById('v-company-input');
  const inDesignation = document.getElementById('v-desig-input');
  const inCity = document.getElementById('v-city-input');
  const inState = document.getElementById('v-state-input');
  const inType = document.getElementById('v-type-input');
  const inStatus = document.getElementById('v-status-input');

  form.reset();
  hiddenId.value = '';

  if (visitorId) {
    title.textContent = 'Edit Visitor Profile';
    const v = db.visitors.find(vis => vis.id === visitorId);
    if (v) {
      hiddenId.value = v.id;
      inName.value = v.name;
      inPhone.value = v.phone;
      inEmail.value = v.email;
      inCompany.value = v.company;
      inDesignation.value = v.designation;
      inCity.value = v.city;
      inState.value = v.state;
      inType.value = v.type;
      inStatus.value = v.status;
    }
  } else {
    title.textContent = 'Add New Visitor';
  }

  openModal('modal-visitor');
}

function submitVisitorForm(e) {
  e.preventDefault();
  const hiddenId = document.getElementById('visitor-modal-id-hidden').value;
  const inName = document.getElementById('v-name-input').value.trim();
  const inPhone = document.getElementById('v-phone-input').value.trim();
  const inEmail = document.getElementById('v-email-input').value.trim();
  const inCompany = document.getElementById('v-company-input').value.trim();
  const inDesignation = document.getElementById('v-desig-input').value.trim();
  const inCity = document.getElementById('v-city-input').value.trim();
  const inState = document.getElementById('v-state-input').value.trim();
  const inType = document.getElementById('v-type-input').value;
  const inStatus = document.getElementById('v-status-input').value;

  const phoneRegex = /^[6-9]\d{9}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!inName || !inPhone || !inEmail || !inCompany || !inDesignation || !inCity || !inState) {
    alert('Please fill out all required fields.');
    return;
  }
  if (!phoneRegex.test(inPhone)) {
    alert('Please enter a valid 10-digit Indian mobile number.');
    return;
  }
  if (!emailRegex.test(inEmail)) {
    alert('Please enter a valid email address.');
    return;
  }

  if (hiddenId) {
    const idx = db.visitors.findIndex(v => v.id === hiddenId);
    if (idx !== -1) {
      db.visitors[idx].name = inName;
      db.visitors[idx].phone = inPhone;
      db.visitors[idx].email = inEmail;
      db.visitors[idx].company = inCompany;
      db.visitors[idx].designation = inDesignation;
      db.visitors[idx].city = inCity;
      db.visitors[idx].state = inState;
      db.visitors[idx].type = inType;
      db.visitors[idx].status = inStatus;
      logActivity(`Visitor <strong>${inName}</strong> profile updated.`);
    }
  } else {
    const passId = `IRE-V-${Math.floor(1000 + Math.random() * 9000)}`;
    const newVisitor = {
      id: passId,
      name: inName,
      phone: inPhone,
      email: inEmail,
      company: inCompany,
      designation: inDesignation,
      city: inCity,
      state: inState,
      type: inType,
      status: inStatus,
      reg_date: new Date().toISOString().split('T')[0]
    };
    db.visitors.push(newVisitor);
    logActivity(`New Visitor <strong>${inName}</strong> registered manually.`);
  }

  commitLocalDatabase(DB_VISITORS, db.visitors);
  closeModal('modal-visitor');
  renderVisitorsTable();
  showToast('💾 Visitor database synchronized.');
}

function quickCheckInVisitor(visitorId) {
  const idx = db.visitors.findIndex(v => v.id === visitorId);
  if (idx !== -1) {
    db.visitors[idx].status = 'checked_in';
    commitLocalDatabase(DB_VISITORS, db.visitors);
    logActivity(`Visitor <strong>${db.visitors[idx].name}</strong> checked-in at reception.`);
    renderVisitorsTable();
    showToast(`Checked-In ${db.visitors[idx].name}`);
  }
}

function deleteVisitorRecord(visitorId) {
  if (!confirm('Are you sure you want to delete this visitor?')) return;
  const filtered = db.visitors.filter(v => v.id !== visitorId);
  commitLocalDatabase(DB_VISITORS, filtered);
  logActivity(`Visitor record <strong>${visitorId}</strong> deleted.`);
  renderVisitorsTable();
  showToast('🗑️ Visitor record removed.');
}

function showVisitorQRPass(visitorId) {
  const v = db.visitors.find(vis => vis.id === visitorId);
  if (!v) return;

  const modal = document.getElementById('modal-qr-pass');
  document.getElementById('pass-ticket-id').textContent = v.id;
  document.getElementById('pass-ticket-name').textContent = v.name;
  document.getElementById('pass-ticket-company').textContent = v.company;
  document.getElementById('pass-ticket-designation').textContent = v.designation;
  document.getElementById('pass-ticket-category').textContent = v.type;
  
  openModal('modal-qr-pass');
}

// Check-In Simulator Scanner
function openCheckInScanner() {
  const modal = document.getElementById('modal-scanner');
  const select = document.getElementById('scanner-visitor-select');
  
  // Populate registered but not checked in list
  const regList = db.visitors.filter(v => v.status === 'registered');
  if (regList.length === 0) {
    select.innerHTML = '<option value="" disabled>No registered visitors pending check-in.</option>';
  } else {
    select.innerHTML = regList.map(v => `<option value="${v.id}">${v.name} (${v.company} - ${v.id})</option>`).join('');
  }

  document.getElementById('scanner-lookup-id').value = '';
  document.getElementById('scanner-preview-card').style.display = 'none';

  openModal('modal-scanner');
}

function lookupScannerVisitor(id) {
  const queryId = id.trim().toUpperCase();
  const v = db.visitors.find(vis => vis.id === queryId);
  
  const preview = document.getElementById('scanner-preview-card');
  const details = document.getElementById('scanner-visitor-details');

  if (!v) {
    alert('No visitor badge matches registration ID: ' + queryId);
    preview.style.display = 'none';
    return;
  }

  details.innerHTML = `
    <div style="font-weight:700; font-size:0.9rem; color:var(--text);">${v.name}</div>
    <div style="font-size:0.75rem; color:var(--text-dim);">${v.company} (${v.designation})</div>
    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:3px;">Category: <strong>${v.type}</strong></div>
    <div style="font-size:0.75rem; color:var(--text-muted);">Status: <span class="status-badge ${v.status === 'checked_in' ? 'available' : 'pending'}">${v.status}</span></div>
  `;
  
  // Save ID in select value
  document.getElementById('scanner-visitor-select').value = v.id;
  preview.style.display = 'block';
}

function submitScannerCheckIn() {
  const visitorId = document.getElementById('scanner-visitor-select').value;
  if (!visitorId) {
    alert('Select or search for a visitor pass first.');
    return;
  }

  const visIdx = db.visitors.findIndex(v => v.id === visitorId);
  if (visIdx !== -1) {
    if (db.visitors[visIdx].status === 'checked_in') {
      alert('Visitor is already checked in.');
      return;
    }

    db.visitors[visIdx].status = 'checked_in';
    commitLocalDatabase(DB_VISITORS, db.visitors);
    logActivity(`Check-In Simulator: Visitor <strong>${db.visitors[visIdx].name}</strong> checked in successfully.`);
    
    // Add Notification
    triggerNotification(`Visitor checked in: <strong>${db.visitors[visIdx].name}</strong>`, 'success');

    closeModal('modal-scanner');
    renderVisitorsTable();
    showToast('✓ Checked-in Attendance!');
  }
}


// ── SPONSOR MANAGEMENT ENGINE ──
function renderSponsorsTable() {
  const tbody = document.getElementById('sponsors-table-body');
  if (!tbody) return;

  const searchQuery = document.getElementById('sponsor-search-query').value.toLowerCase().trim();
  let filtered = db.sponsors;

  if (searchQuery) {
    filtered = filtered.filter(s => 
      s.company.toLowerCase().includes(searchQuery) ||
      s.type.toLowerCase().includes(searchQuery) ||
      s.contact_person.toLowerCase().includes(searchQuery)
    );
  }

  document.getElementById('sponsor-table-count').textContent = `${filtered.length} Sponsors found`;

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem; color:var(--text-muted);">No sponsors matching query.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    let statClass = 'available';
    if (s.status === 'paid') statClass = 'available';
    else if (s.status === 'confirmed') statClass = 'pending';
    else if (s.status === 'negotiation') statClass = 'reserved';
    else statClass = 'sold';

    const renderActions = activeRole === 'sales_executive' ? `
      <span style="font-size:0.65rem; color:var(--text-muted); font-style:italic;">No edit perm</span>
    ` : `
      <button class="btn-table-icon" onclick="openSponsorModal('${s.id}')" title="Edit Sponsor">✏️</button>
      <button class="btn-table-icon danger" onclick="deleteSponsorRecord('${s.id}')" title="Delete Sponsor">🗑️</button>
    `;

    return `
      <tr>
        <td><strong>${s.company}</strong></td>
        <td><span class="tag-pill" style="font-size:9.5px; font-weight:700; background:rgba(242,68,5,0.06); color:var(--copper);">${s.type}</span></td>
        <td>${s.contact_person}<br><span style="font-size:0.65rem; color:var(--text-muted);">${s.phone}</span></td>
        <td><a href="mailto:${s.email}" style="font-size:0.75rem;">${s.email}</a></td>
        <td><strong>₹${s.amount.toLocaleString('en-IN')}</strong></td>
        <td><span style="font-size:0.7rem; color:var(--text-muted);">${s.agreement || 'No agreement uploaded'}</span></td>
        <td><span class="status-badge ${statClass}">${s.status}</span></td>
        <td><div class="table-actions">${renderActions}</div></td>
      </tr>
    `;
  }).join('');
}

function openSponsorModal(sponsorId) {
  const modal = document.getElementById('modal-sponsor');
  const form = document.getElementById('sponsor-modal-form');
  const title = document.getElementById('sponsor-modal-title');
  const hiddenId = document.getElementById('sponsor-modal-id-hidden');

  const inCompany = document.getElementById('s-company-input');
  const inType = document.getElementById('s-type-input');
  const inContact = document.getElementById('s-contact-input');
  const inPhone = document.getElementById('s-phone-input');
  const inEmail = document.getElementById('s-email-input');
  const inAmount = document.getElementById('s-amount-input');
  const inBenefits = document.getElementById('s-benefits-input');
  const inStatus = document.getElementById('s-status-input');

  form.reset();
  hiddenId.value = '';

  if (sponsorId) {
    title.textContent = 'Edit Sponsor Package';
    const s = db.sponsors.find(sp => sp.id === sponsorId);
    if (s) {
      hiddenId.value = s.id;
      inCompany.value = s.company;
      inType.value = s.type;
      inContact.value = s.contact_person;
      inPhone.value = s.phone;
      inEmail.value = s.email;
      inAmount.value = s.amount;
      inBenefits.value = s.benefits;
      inStatus.value = s.status;
    }
  } else {
    title.textContent = 'Add Sponsor Profile';
  }

  openModal('modal-sponsor');
}

function submitSponsorForm(e) {
  e.preventDefault();
  const hiddenId = document.getElementById('sponsor-modal-id-hidden').value;
  const inCompany = document.getElementById('s-company-input').value.trim();
  const inType = document.getElementById('s-type-input').value;
  const inContact = document.getElementById('s-contact-input').value.trim();
  const inPhone = document.getElementById('s-phone-input').value.trim();
  const inEmail = document.getElementById('s-email-input').value.trim();
  const inAmount = parseFloat(document.getElementById('s-amount-input').value);
  const inBenefits = document.getElementById('s-benefits-input').value.trim();
  const inStatus = document.getElementById('s-status-input').value;

  if (!inCompany || !inContact || !inPhone || !inEmail || isNaN(inAmount)) {
    alert('Please fill out all required fields.');
    return;
  }

  if (hiddenId) {
    const idx = db.sponsors.findIndex(s => s.id === hiddenId);
    if (idx !== -1) {
      db.sponsors[idx].company = inCompany;
      db.sponsors[idx].type = inType;
      db.sponsors[idx].contact_person = inContact;
      db.sponsors[idx].phone = inPhone;
      db.sponsors[idx].email = inEmail;
      db.sponsors[idx].amount = inAmount;
      db.sponsors[idx].benefits = inBenefits;
      db.sponsors[idx].status = inStatus;
      logActivity(`Sponsor <strong>${inCompany}</strong> details updated.`);
    }
  } else {
    const newSponsor = {
      id: 'sp-' + Date.now(),
      company: inCompany,
      type: inType,
      contact_person: inContact,
      phone: inPhone,
      email: inEmail,
      amount: inAmount,
      benefits: inBenefits,
      agreement: '',
      status: inStatus
    };
    db.sponsors.push(newSponsor);
    
    // Add Notification
    triggerNotification(`New Sponsor Added: <strong>${inCompany}</strong> (${inType})`, 'success');
    logActivity(`Sponsor partner <strong>${inCompany}</strong> added.`);
  }

  commitLocalDatabase(DB_SPONSORS, db.sponsors);
  closeModal('modal-sponsor');
  renderSponsorsTable();
  showToast('💾 Sponsors database saved.');
}

function uploadSponsorAgreement(input) {
  const file = input.files[0];
  if (!file) return;

  const hiddenId = document.getElementById('sponsor-modal-id-hidden').value;
  if (!hiddenId) {
    alert('Please save the sponsor profile first.');
    input.value = '';
    return;
  }

  const idx = db.sponsors.findIndex(s => s.id === hiddenId);
  if (idx !== -1) {
    db.sponsors[idx].agreement = file.name;
    commitLocalDatabase(DB_SPONSORS, db.sponsors);
    renderSponsorsTable();
    showToast(`📎 Uploaded agreement: ${file.name}`);
  }
  input.value = '';
}

function deleteSponsorRecord(sponsorId) {
  if (!confirm('Are you sure you want to delete this sponsor record?')) return;
  const filtered = db.sponsors.filter(s => s.id !== sponsorId);
  commitLocalDatabase(DB_SPONSORS, filtered);
  logActivity(`Sponsor record <strong>${sponsorId}</strong> deleted.`);
  renderSponsorsTable();
  showToast('🗑️ Sponsor record removed.');
}


// ── AGENDA & SPEAKER MANAGEMENT ENGINE ──
let activeAgendaDayTab = 1;

function switchAgendaDayTab(dayNum) {
  activeAgendaDayTab = dayNum;
  document.querySelectorAll('.agenda-day-tab').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`day-tab-${dayNum}`).classList.add('active');
  renderAgendaList();
}

function renderAgendaList() {
  const container = document.getElementById('agenda-sessions-list');
  if (!container) return;

  // Filter day
  let sessions = db.agenda.filter(s => s.day === activeAgendaDayTab);
  // Sort by sort_order
  sessions.sort((a, b) => a.sort_order - b.sort_order);

  if (sessions.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding: 3rem; color:var(--text-muted);">No sessions scheduled for this day yet.</div>';
    return;
  }

  container.innerHTML = sessions.map((s, index) => {
    const speaker = db.speakers.find(sp => sp.id === s.speaker_id);
    const speakerName = speaker ? `🎙️ ${speaker.name} (${speaker.org})` : 'No speaker assigned';
    const pubBadge = s.published ? '<span class="status-badge available" style="font-size:8px;">Published</span>' : '<span class="status-badge sold" style="font-size:8px;">Draft</span>';

    const renderActions = activeRole === 'sales_executive' ? '' : `
      <div style="display:flex; flex-direction:column; gap:4px;">
        <button class="btn-table-icon" style="padding:2px; height:20px; width:20px;" onclick="moveAgendaSession('${s.id}', -1)" title="Move Up">▲</button>
        <button class="btn-table-icon" style="padding:2px; height:20px; width:20px;" onclick="moveAgendaSession('${s.id}', 1)" title="Move Down">▼</button>
      </div>
      <button class="btn-table-icon" onclick="openSessionModal('${s.id}')" title="Edit Session">✏️</button>
      <button class="btn-table-icon danger" onclick="deleteAgendaSession('${s.id}')" title="Delete Session">🗑️</button>
    `;

    return `
      <div class="agenda-session-card" draggable="true" ondragstart="handleDragStart(event, '${s.id}')" ondragover="handleDragOver(event)" ondrop="handleDrop(event, ${index})">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <span class="tag-pill" style="font-size:8px; font-weight:700; background:rgba(242,68,5,0.06); color:var(--copper);">${s.type}</span>
            <span style="font-size:0.65rem; color:var(--text-muted); font-weight:700; margin-left:8px;">🕒 ${s.start_time} - ${s.end_time} | Venue: ${s.venue}</span>
          </div>
          <div>
            ${pubBadge}
          </div>
        </div>
        <h4 style="font-family:var(--font-display); font-size:0.95rem; font-weight:800; margin: 4px 0 2px;">${s.title}</h4>
        <p style="font-size:0.75rem; color:var(--text-dim); line-height:1.4; margin-bottom:4px;">${s.desc}</p>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.72rem; font-weight:700; color:var(--copper-dk);">${speakerName}</span>
          <div style="display:flex; gap:6px; align-items:center;">
            ${renderActions}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Binds Drag and Drop hooks
let draggedSessionId = null;

function handleDragStart(e, sessionId) {
  draggedSessionId = sessionId;
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e, targetIndex) {
  e.preventDefault();
  if (!draggedSessionId) return;

  const daySessions = db.agenda.filter(s => s.day === activeAgendaDayTab).sort((a, b) => a.sort_order - b.sort_order);
  const draggedIdx = daySessions.findIndex(s => s.id === draggedSessionId);
  if (draggedIdx === -1 || draggedIdx === targetIndex) return;

  const [draggedSession] = daySessions.splice(draggedIdx, 1);
  daySessions.splice(targetIndex, 0, draggedSession);

  // Recalculate sort order
  daySessions.forEach((s, idx) => {
    const dbIdx = db.agenda.findIndex(item => item.id === s.id);
    if (dbIdx !== -1) {
      db.agenda[dbIdx].sort_order = idx + 1;
    }
  });

  commitLocalDatabase(DB_AGENDA, db.agenda);
  logActivity(`Agenda schedule sessions reordered.`);
  renderAgendaList();
  showToast('✓ Timetable schedule reordered.');
}

function moveAgendaSession(id, direction) {
  const daySessions = db.agenda.filter(s => s.day === activeAgendaDayTab).sort((a, b) => a.sort_order - b.sort_order);
  const idx = daySessions.findIndex(s => s.id === id);
  if (idx === -1) return;

  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= daySessions.length) return;

  // Swap sort orders
  const temp = daySessions[idx].sort_order;
  
  const originalDbIdx = db.agenda.findIndex(item => item.id === daySessions[idx].id);
  const targetDbIdx = db.agenda.findIndex(item => item.id === daySessions[targetIdx].id);

  db.agenda[originalDbIdx].sort_order = daySessions[targetIdx].sort_order;
  db.agenda[targetDbIdx].sort_order = temp;

  commitLocalDatabase(DB_AGENDA, db.agenda);
  renderAgendaList();
}

function openSessionModal(sessionId) {
  const modal = document.getElementById('modal-session');
  const form = document.getElementById('session-modal-form');
  const title = document.getElementById('session-modal-title');
  const hiddenId = document.getElementById('session-modal-id-hidden');

  const inTitle = document.getElementById('ses-title-input');
  const inDesc = document.getElementById('ses-desc-input');
  const inSpeaker = document.getElementById('ses-speaker-input');
  const inVenue = document.getElementById('ses-venue-input');
  const inDay = document.getElementById('ses-day-input');
  const inStart = document.getElementById('ses-start-input');
  const inEnd = document.getElementById('ses-end-input');
  const inType = document.getElementById('ses-type-input');
  const inPub = document.getElementById('ses-pub-input');

  form.reset();
  hiddenId.value = '';
  populateSessionSpeakerDropdown();

  if (sessionId) {
    title.textContent = 'Edit Schedule Session';
    const s = db.agenda.find(ses => ses.id === sessionId);
    if (s) {
      hiddenId.value = s.id;
      inTitle.value = s.title;
      inDesc.value = s.desc;
      inSpeaker.value = s.speaker_id || '';
      inVenue.value = s.venue;
      inDay.value = s.day;
      inStart.value = s.start_time;
      inEnd.value = s.end_time;
      inType.value = s.type;
      inPub.value = s.published ? 'true' : 'false';
    }
  } else {
    title.textContent = 'Create New Session';
  }

  openModal('modal-session');
}

function populateSessionSpeakerDropdown() {
  const select = document.getElementById('ses-speaker-input');
  if (!select) return;
  select.innerHTML = '<option value="">No speaker assigned</option>' + db.speakers.map(spk => `
    <option value="${spk.id}">${spk.name} (${spk.org})</option>
  `).join('');
}

function submitSessionForm(e) {
  e.preventDefault();
  const hiddenId = document.getElementById('session-modal-id-hidden').value;
  const inTitle = document.getElementById('ses-title-input').value.trim();
  const inDesc = document.getElementById('ses-desc-input').value.trim();
  const inSpeakerId = document.getElementById('ses-speaker-input').value;
  const inVenue = document.getElementById('ses-venue-input').value.trim();
  const inDay = parseInt(document.getElementById('ses-day-input').value);
  const inStart = document.getElementById('ses-start-input').value.trim();
  const inEnd = document.getElementById('ses-end-input').value.trim();
  const inType = document.getElementById('ses-type-input').value;
  const inPub = document.getElementById('ses-pub-input').value === 'true';

  if (!inTitle || !inVenue || !inStart || !inEnd) {
    alert('Please fill out all required fields.');
    return;
  }

  if (hiddenId) {
    const idx = db.agenda.findIndex(s => s.id === hiddenId);
    if (idx !== -1) {
      db.agenda[idx].title = inTitle;
      db.agenda[idx].desc = inDesc;
      db.agenda[idx].speaker_id = inSpeakerId || null;
      db.agenda[idx].venue = inVenue;
      db.agenda[idx].day = inDay;
      db.agenda[idx].start_time = inStart;
      db.agenda[idx].end_time = inEnd;
      db.agenda[idx].type = inType;
      db.agenda[idx].published = inPub;
      logActivity(`Agenda session <strong>${inTitle}</strong> details updated.`);
    }
  } else {
    const daySessions = db.agenda.filter(s => s.day === inDay);
    const nextSort = daySessions.length + 1;

    const newSession = {
      id: 'ses-' + Date.now(),
      day: inDay,
      title: inTitle,
      desc: inDesc,
      speaker_id: inSpeakerId || null,
      venue: inVenue,
      start_time: inStart,
      end_time: inEnd,
      type: inType,
      published: inPub,
      sort_order: nextSort
    };
    db.agenda.push(newSession);
    logActivity(`New session <strong>${inTitle}</strong> added to Day ${inDay}.`);
  }

  commitLocalDatabase(DB_AGENDA, db.agenda);
  closeModal('modal-session');
  renderAgendaList();
  showToast('💾 Timetable schedule saved.');
}

function deleteAgendaSession(sessionId) {
  if (!confirm('Are you sure you want to delete this session?')) return;
  const filtered = db.agenda.filter(s => s.id !== sessionId);
  commitLocalDatabase(DB_AGENDA, filtered);
  logActivity(`Session record <strong>${sessionId}</strong> deleted.`);
  renderAgendaList();
  showToast('🗑️ Session removed.');
}


// Speakers list
function renderSpeakersList() {
  const container = document.getElementById('speakers-list');
  if (!container) return;

  if (db.speakers.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding: 2rem; color:var(--text-muted); font-size:0.75rem;">No speakers in database directory.</div>';
    return;
  }

  container.innerHTML = db.speakers.map(spk => {
    const renderActions = activeRole === 'sales_executive' ? '' : `
      <div style="margin-top:10px; display:flex; gap:6px;">
        <button class="btn-action-outline" style="font-size:10px; padding:3px 6px;" onclick="openSpeakerModal('${spk.id}')">✏️ Edit</button>
        <button class="btn-action-danger" style="font-size:10px; padding:3px 6px;" onclick="deleteSpeakerRecord('${spk.id}')">🗑️ Delete</button>
      </div>
    `;

    return `
      <div class="speaker-directory-card">
        <div style="display:flex; gap:10px; align-items:flex-start;">
          <div style="width:36px; height:36px; border-radius:50%; background:#EEF5F0; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:1.1rem; flex-shrink:0;">🎙️</div>
          <div>
            <h5 style="font-weight:700; font-size:0.82rem; color:var(--text);">${spk.name}</h5>
            <p style="font-size:0.68rem; color:var(--text-muted);">${spk.designation}, <strong>${spk.org}</strong></p>
            <p style="font-size:0.68rem; color:var(--text-dim); line-height:1.3; margin-top:4px;">${spk.bio || 'No bio cataloged'}</p>
            <a href="${spk.linkedin}" target="_blank" style="font-size:0.65rem; color:var(--copper); font-weight:700; margin-top:4px; display:inline-block;">🔗 LinkedIn Profile</a>
            ${renderActions}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openSpeakerModal(speakerId) {
  const modal = document.getElementById('modal-speaker');
  const form = document.getElementById('speaker-modal-form');
  const title = document.getElementById('speaker-modal-title');
  const hiddenId = document.getElementById('speaker-modal-id-hidden');

  const inName = document.getElementById('spk-name-input');
  const inDes = document.getElementById('spk-desig-input');
  const inOrg = document.getElementById('spk-org-input');
  const inBio = document.getElementById('spk-bio-input');
  const inLnk = document.getElementById('spk-linkedin-input');

  form.reset();
  hiddenId.value = '';

  if (speakerId) {
    title.textContent = 'Edit Speaker Profile';
    const spk = db.speakers.find(s => s.id === speakerId);
    if (spk) {
      hiddenId.value = spk.id;
      inName.value = spk.name;
      inDes.value = spk.designation;
      inOrg.value = spk.org;
      inBio.value = spk.bio || '';
      inLnk.value = spk.linkedin || '';
    }
  } else {
    title.textContent = 'Add New Speaker';
  }

  openModal('modal-speaker');
}

function submitSpeakerForm(e) {
  e.preventDefault();
  const hiddenId = document.getElementById('speaker-modal-id-hidden').value;
  const inName = document.getElementById('spk-name-input').value.trim();
  const inDes = document.getElementById('spk-desig-input').value.trim();
  const inOrg = document.getElementById('spk-org-input').value.trim();
  const inBio = document.getElementById('spk-bio-input').value.trim();
  const inLnk = document.getElementById('spk-linkedin-input').value.trim();

  if (!inName || !inDes || !inOrg) {
    alert('Please fill out all required fields.');
    return;
  }

  if (hiddenId) {
    const idx = db.speakers.findIndex(s => s.id === hiddenId);
    if (idx !== -1) {
      db.speakers[idx].name = inName;
      db.speakers[idx].designation = inDes;
      db.speakers[idx].org = inOrg;
      db.speakers[idx].bio = inBio;
      db.speakers[idx].linkedin = inLnk;
      logActivity(`Speaker <strong>${inName}</strong> profile updated.`);
    }
  } else {
    const newSpk = {
      id: 'spk-' + Date.now(),
      name: inName,
      designation: inDes,
      org: inOrg,
      bio: inBio,
      linkedin: inLnk,
      photo: ''
    };
    db.speakers.push(newSpk);
    logActivity(`Speaker directory: <strong>${inName}</strong> added.`);
  }

  commitLocalDatabase(DB_SPEAKERS, db.speakers);
  closeModal('modal-speaker');
  renderSpeakersList();
  populateSessionSpeakerDropdown();
  showToast('💾 Speaker directory synced.');
}

function deleteSpeakerRecord(speakerId) {
  if (!confirm('Are you sure you want to delete this speaker? Sessions assigned to them will remain speaker-less.')) return;
  const filtered = db.speakers.filter(s => s.id !== speakerId);
  commitLocalDatabase(DB_SPEAKERS, filtered);
  logActivity(`Speaker record <strong>${speakerId}</strong> deleted.`);
  renderSpeakersList();
  populateSessionSpeakerDropdown();
  showToast('🗑️ Speaker profile removed.');
}


// ── MARKETING CAMPAIGNS & INQUIRIES CRM ENGINE ──
function renderCampaignsList() {
  const container = document.getElementById('marketing-campaigns-list');
  if (!container) return;

  if (db.campaigns.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding: 2rem; color:var(--text-muted); font-size:0.75rem;">No marketing campaigns logged.</div>';
    return;
  }

  container.innerHTML = db.campaigns.map(c => {
    // Math indicators
    const openPct = c.sent > 0 ? ((c.opened / c.sent) * 100).toFixed(0) : 0;
    const clickPct = c.opened > 0 ? ((c.clicked / c.opened) * 100).toFixed(0) : 0;

    return `
      <div class="campaign-summary-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
          <div>
            <h5 style="font-weight:800; font-size:0.84rem; color:var(--text);">${c.name}</h5>
            <span style="font-size:0.62rem; color:var(--text-muted); font-weight:700;">📅 Launch: ${c.launch_date} | Channel: <strong>${c.type}</strong></span>
          </div>
          <span class="tag-pill" style="font-size:8px; font-weight:700; background:rgba(46,125,50,0.08); color:var(--status-available);">⚡ ${c.leads_generated} Leads</span>
        </div>
        
        <p style="font-size:0.7rem; color:var(--text-dim); margin-bottom:10px;">Target: ${c.audience}</p>
        
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; background:var(--bg-section); padding:8px; border-radius:6px; border:1px solid var(--border); text-align:center;">
          <div><div style="font-size:0.74rem; font-weight:800;">${c.sent}</div><div style="font-size:6.5px; color:var(--text-muted); text-transform:uppercase;">Sent</div></div>
          <div><div style="font-size:0.74rem; font-weight:800;">${c.delivered}</div><div style="font-size:6.5px; color:var(--text-muted); text-transform:uppercase;">Deliv</div></div>
          <div><div style="font-size:0.74rem; font-weight:800;">${c.opened} <span style="font-size:6px; color:var(--copper); font-weight:800;">(${openPct}%)</span></div><div style="font-size:6.5px; color:var(--text-muted); text-transform:uppercase;">Opens</div></div>
          <div><div style="font-size:0.74rem; font-weight:800;">${c.clicked} <span style="font-size:6px; color:var(--copper); font-weight:800;">(${clickPct}%)</span></div><div style="font-size:6.5px; color:var(--text-muted); text-transform:uppercase;">Clicks</div></div>
        </div>
      </div>
    `;
  }).join('');
}

function openCampaignModal() {
  openModal('modal-campaign');
}

function submitCampaignForm(e) {
  e.preventDefault();
  const inName = document.getElementById('c-name-input').value.trim();
  const inType = document.getElementById('c-type-input').value;
  const inAudience = document.getElementById('c-aud-input').value.trim();
  const inSent = parseInt(document.getElementById('c-sent-input').value) || 0;

  if (!inName || !inAudience || inSent <= 0) {
    alert('Please fill out all required fields.');
    return;
  }

  // Simulate metrics
  const deliv = Math.floor(inSent * (0.95 + Math.random() * 0.04));
  const open = Math.floor(deliv * (0.4 + Math.random() * 0.3));
  const clicks = Math.floor(open * (0.15 + Math.random() * 0.15));
  const leads = Math.floor(clicks * (0.1 + Math.random() * 0.15));

  const newCampaign = {
    id: 'camp-' + Date.now(),
    name: inName,
    type: inType,
    launch_date: new Date().toISOString().split('T')[0],
    audience: inAudience,
    leads_generated: leads,
    sent: inSent,
    delivered: deliv,
    opened: open,
    clicked: clicks
  };

  db.campaigns.push(newCampaign);
  commitLocalDatabase(DB_CAMPAIGNS, db.campaigns);
  logActivity(`New marketing campaign <strong>${inName}</strong> launched.`);
  closeModal('modal-campaign');
  renderCampaignsList();
  showToast('💾 Campaign logs registered.');
}


// B2B Inquiries CRM Board
function renderInquiriesTable() {
  const tbody = document.getElementById('inquiries-table-body');
  if (!tbody) return;

  const filterType = document.getElementById('inq-filter-type').value;
  const filterStatus = document.getElementById('inq-filter-status').value;

  let filtered = db.inquiries;

  if (filterType) filtered = filtered.filter(i => i.type === filterType);
  if (filterStatus) filtered = filtered.filter(i => i.status === filterStatus);

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem; color:var(--text-muted);">No inquiries logged in database.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(inq => {
    let statClass = 'available';
    if (inq.status === 'new') statClass = 'sold';
    else if (inq.status === 'in_progress') statClass = 'reserved';

    const renderActions = activeRole === 'sales_executive' ? `
      <span style="font-size:0.65rem; color:var(--text-muted); font-style:italic;">Read-only</span>
    ` : `
      <button class="btn-table-icon" style="color:var(--copper);" onclick="openInquiryReplyModal('${inq.id}')" title="Reply Email / Assign User">✉️ Reply</button>
      <button class="btn-table-icon danger" onclick="archiveInquiryRecord('${inq.id}')" title="Archive / Delete">🗑️ Archive</button>
    `;

    return `
      <tr>
        <td><strong>${inq.company}</strong><br><span style="font-size:0.65rem; color:var(--text-muted);">${inq.name}</span></td>
        <td><span class="tag-pill" style="font-size:9px; font-weight:700;">${inq.type}</span></td>
        <td><a href="tel:${inq.phone}">${inq.phone}</a><br><a href="mailto:${inq.email}" style="font-size:0.7rem; color:var(--text-muted);">${inq.email}</a></td>
        <td><p style="font-size:0.72rem; max-width:250px; white-space:normal; line-height:1.4;">${inq.message}</p></td>
        <td><strong>${inq.assigned_to || 'Unassigned'}</strong></td>
        <td><span class="status-badge ${statClass}">${inq.status.replace('_', ' ')}</span></td>
        <td><div class="table-actions">${renderActions}</div></td>
      </tr>
    `;
  }).join('');
}

function openInquiryReplyModal(inqId) {
  const inq = db.inquiries.find(i => i.id === inqId);
  if (!inq) return;

  const modal = document.getElementById('modal-inq-reply');
  document.getElementById('inq-reply-id-hidden').value = inq.id;
  document.getElementById('inq-reply-company-display').value = inq.company;
  document.getElementById('inq-reply-to').value = inq.email;
  document.getElementById('inq-reply-owner').value = inq.assigned_to || 'Hari Prasad';
  document.getElementById('inq-reply-body').value = `Hi ${inq.name},\n\nThank you for reaching out regarding IRE Expo 2026. This is to confirm that we have received your inquiry:\n"${inq.message}"\n\nOur sales coordinator will get in touch shortly.\n\nBest regards,\nExhibitor Committee`;

  populateInquirySalesExecDropdown();
  openModal('modal-inq-reply');
}

function populateInquirySalesExecDropdown() {
  const select = document.getElementById('inq-reply-owner');
  if (!select) return;
  select.innerHTML = db.users.map(u => `<option value="${u.name}">${u.name} (${u.role})</option>`).join('');
}

function submitInquiryReply(e) {
  e.preventDefault();
  const inqId = document.getElementById('inq-reply-id-hidden').value;
  const inOwner = document.getElementById('inq-reply-owner').value;
  const inBody = document.getElementById('inq-reply-body').value.trim();

  const idx = db.inquiries.findIndex(i => i.id === inqId);
  if (idx !== -1) {
    db.inquiries[idx].assigned_to = inOwner;
    db.inquiries[idx].status = 'resolved'; // Mark resolved on reply
    
    commitLocalDatabase(DB_INQUIRIES, db.inquiries);
    logActivity(`Inquiry reply drafted to <strong>${db.inquiries[idx].company}</strong>. Assigned owner: <strong>${inOwner}</strong>.`);
    closeModal('modal-inq-reply');
    renderInquiriesTable();
    showToast('✉️ Reply dispatched & Status Resolved.');
  }
}

function archiveInquiryRecord(inqId) {
  if (!confirm('Are you sure you want to archive this inquiry? It will be removed from active CRM board.')) return;
  const filtered = db.inquiries.filter(i => i.id !== inqId);
  commitLocalDatabase(DB_INQUIRIES, filtered);
  logActivity(`Inquiry record <strong>${inqId}</strong> archived.`);
  renderInquiriesTable();
  showToast('🗑️ Inquiry archived.');
}


// ── MEDIA GALLERY & DOCUMENT CENTER ENGINE ──
function renderDocumentsRepository() {
  const container = document.getElementById('documents-list-container');
  if (!container) return;

  // Compile document file listings
  // Pull from Stalls, Exhibitors, Sponsors, and Venue
  let docs = [];

  // Exhibitor files
  db.exhibitors.forEach(e => {
    if (e.documents) {
      e.documents.forEach(d => {
        docs.push({ name: d.name, size: d.size, date: d.date, category: 'Agreements', source: `Exhibitor: ${e.company}` });
      });
    }
  });

  // Sponsors files
  db.sponsors.forEach(s => {
    if (s.agreement) {
      docs.push({ name: s.agreement, size: '420 KB', date: '2026-05-18', category: 'Agreements', source: `Sponsor: ${s.company}` });
    }
  });

  // Venue plans
  const assets = db.venue.assets || {};
  Object.keys(assets).forEach(key => {
    const item = assets[key];
    if (item) {
      docs.push({ name: item.name, size: item.size, date: item.date, category: key === 'floor_plan' ? 'Floor Plans' : 'Brochures', source: 'Venue Management' });
    }
  });

  if (docs.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding: 2rem; color:var(--text-muted); font-size:0.75rem;">No files uploaded in document repository.</div>';
    return;
  }

  container.innerHTML = docs.map(doc => `
    <div class="uploaded-file-item" style="margin-bottom:6px;">
      <div>
        <span class="fn">${doc.name}</span><br>
        <span class="meta">Category: <strong>${doc.category}</strong> | Source: ${doc.source}</span>
      </div>
      <div style="display:flex; gap:4px; align-items:center;">
        <span class="meta">${doc.size}</span>
        <button class="btn-table-icon" onclick="alert('📥 Download started: ' + '${doc.name}')" title="Download file">💾</button>
      </div>
    </div>
  `).join('');
}

function handleDocumentRepoUpload(input) {
  const file = input.files[0];
  if (!file) return;

  // Seed to venue floor plan or brochures asset lists
  if (!db.venue.assets) db.venue.assets = {};
  db.venue.assets['brochure_file'] = {
    name: file.name,
    size: `${(file.size / 1024).toFixed(0)} KB`,
    date: new Date().toISOString().split('T')[0]
  };

  commitLocalDatabase(DB_VENUE, db.venue);
  renderDocumentsRepository();
  showToast(`📎 File ${file.name} saved to Document Center.`);
  input.value = '';
}

// Media gallery displays uploader and categorizer
function renderMediaGalleryGrid() {
  const container = document.getElementById('media-gallery-grid-container');
  if (!container) return;

  const category = document.getElementById('gallery-filter-category').value;
  let filtered = db.gallery;

  if (category) {
    filtered = filtered.filter(g => g.category === category);
  }

  if (filtered.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 3rem; color:var(--text-muted); font-size:0.8rem;">No media files uploaded in this gallery category.</div>';
    return;
  }

  container.innerHTML = filtered.map(g => `
    <div style="border: 1px solid var(--border); border-radius: 6px; padding: 8px; background:#fff; text-align:center; position:relative;">
      <span class="tag-pill" style="position:absolute; top:12px; left:12px; font-size:7px; font-weight:700; background:rgba(242,68,5,0.95); color:#fff; z-index:2;">${g.category}</span>
      <img src="${g.src}" style="width:100%; height:110px; object-fit:cover; border-radius: 4px; margin-bottom:5px;" alt="gallery image">
      <div style="font-size:9px; font-weight:700; color:var(--text-dim); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${g.filename}</div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px;">
        <span style="font-size:7.5px; color:var(--text-muted);">${g.size}</span>
        ${activeRole === 'sales_executive' ? '' : `<button class="btn-table-icon danger" style="padding:1px; height:18px; width:18px; font-size:6px;" onclick="deleteGalleryPhoto('${g.id}')">🗑️</button>`}
      </div>
    </div>
  `).join('');
}

function handleGalleryPhotoUpload(input) {
  const file = input.files[0];
  if (!file) return;

  const category = document.getElementById('gallery-upload-category-input').value;
  
  // Create object URL for local preview
  const reader = new FileReader();
  reader.onload = (e) => {
    const newPhoto = {
      id: 'img-' + Date.now(),
      filename: file.name,
      category: category,
      size: `${(file.size / 1024).toFixed(0)} KB`,
      date: new Date().toISOString().split('T')[0],
      src: e.target.result // Base64 data
    };

    db.gallery.push(newPhoto);
    commitLocalDatabase(DB_GALLERY, db.gallery);
    renderMediaGalleryGrid();
    showToast(`📸 Photo ${file.name} uploaded to gallery.`);
  };
  reader.readAsDataURL(file);
  input.value = '';
}

function deleteGalleryPhoto(id) {
  if (!confirm('Are you sure you want to delete this photo from the gallery?')) return;
  const filtered = db.gallery.filter(g => g.id !== id);
  commitLocalDatabase(DB_GALLERY, filtered);
  renderMediaGalleryGrid();
  showToast('🗑️ Photo deleted.');
}


// ── EVENT REPORTS GENERATOR ──
let activeReportTab = 'visitor';

function switchReportTab(reportType) {
  activeReportTab = reportType;
  document.querySelectorAll('.report-type-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`report-btn-${reportType}`).classList.add('active');
  renderReportPreviewSummary();
}

function renderReportPreviewSummary() {
  const title = document.getElementById('report-summary-title');
  const details = document.getElementById('report-summary-details');
  if (!title || !details) return;

  let html = '';

  if (activeReportTab === 'visitor') {
    title.textContent = 'Visitor Attendance Audit Report';
    const regCount = db.visitors.length;
    const checkCount = db.visitors.filter(v => v.status === 'checked_in').length;
    const typeBreakdown = {};
    db.visitors.forEach(v => {
      typeBreakdown[v.type] = (typeBreakdown[v.type] || 0) + 1;
    });

    html = `
      <div style="margin-bottom:1.5rem;">
        <h5 style="font-weight:700; margin-bottom:8px; border-bottom:1px dashed #eee; padding-bottom:4px;">KPI METRICS</h5>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; text-align:center;">
          <div style="background:var(--bg-section); padding:10px; border-radius:4px;"><strong>${regCount}</strong><br><span style="font-size:0.62rem; color:var(--text-muted); text-transform:uppercase;">Registered</span></div>
          <div style="background:var(--bg-section); padding:10px; border-radius:4px;"><strong>${checkCount}</strong><br><span style="font-size:0.62rem; color:var(--text-muted); text-transform:uppercase;">Checked-In</span></div>
          <div style="background:var(--bg-section); padding:10px; border-radius:4px;"><strong>${regCount > 0 ? ((checkCount/regCount)*100).toFixed(0) : 0}%</strong><br><span style="font-size:0.62rem; color:var(--text-muted); text-transform:uppercase;">Attendance</span></div>
        </div>
      </div>

      <div>
        <h5 style="font-weight:700; margin-bottom:8px; border-bottom:1px dashed #eee; padding-bottom:4px;">ATTENDANCE CATEGORY BREAKDOWN</h5>
        <table class="datatable" style="font-size:0.75rem;">
          <thead><tr><th>Visitor Category</th><th>Count</th><th>Percentage</th></tr></thead>
          <tbody>
            ${Object.keys(typeBreakdown).map(k => `
              <tr><td><strong>${k}</strong></td><td>${typeBreakdown[k]}</td><td>${((typeBreakdown[k]/regCount)*100).toFixed(1)}%</td></tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (activeReportTab === 'sponsor') {
    title.textContent = 'Corporate Sponsor Funding Report';
    const count = db.sponsors.length;
    let totalFunding = 0;
    db.sponsors.forEach(s => {
      if (s.status === 'confirmed' || s.status === 'paid') totalFunding += s.amount;
    });

    html = `
      <div style="margin-bottom:1.5rem;">
        <h5 style="font-weight:700; margin-bottom:8px; border-bottom:1px dashed #eee; padding-bottom:4px;">FINANCIAL OVERVIEW</h5>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; text-align:center;">
          <div style="background:var(--bg-section); padding:10px; border-radius:4px;"><strong>${count}</strong><br><span style="font-size:0.62rem; color:var(--text-muted); text-transform:uppercase;">Total Sponsors</span></div>
          <div style="background:var(--bg-section); padding:10px; border-radius:4px;"><strong style="color:var(--status-available);">₹${totalFunding.toLocaleString('en-IN')}</strong><br><span style="font-size:0.62rem; color:var(--text-muted); text-transform:uppercase;">Collected Funding</span></div>
        </div>
      </div>

      <div>
        <h5 style="font-weight:700; margin-bottom:8px; border-bottom:1px dashed #eee; padding-bottom:4px;">SPONSORS ROSTER</h5>
        <table class="datatable" style="font-size:0.75rem;">
          <thead><tr><th>Company</th><th>Tier Package</th><th>Funding Amount</th><th>Contract Status</th></tr></thead>
          <tbody>
            ${db.sponsors.map(s => `
              <tr><td><strong>${s.company}</strong></td><td>${s.type}</td><td>₹${s.amount.toLocaleString()}</td><td><span class="status-badge available">${s.status}</span></td></tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (activeReportTab === 'exhibitor') {
    title.textContent = 'Exhibitors Allocation Audit Report';
    const exhCount = db.exhibitors.length;
    const categoryBreakdown = {};
    db.exhibitors.forEach(e => {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + 1;
    });

    html = `
      <div style="margin-bottom:1.5rem;">
        <h5 style="font-weight:700; margin-bottom:8px; border-bottom:1px dashed #eee; padding-bottom:4px;">KEY METRICS</h5>
        <div style="background:var(--bg-section); padding:10px; border-radius:4px; text-align:center;">
          <strong>${exhCount}</strong><br><span style="font-size:0.62rem; color:var(--text-muted); text-transform:uppercase;">Active Confirmed Exhibitor profiles</span>
        </div>
      </div>

      <div>
        <h5 style="font-weight:700; margin-bottom:8px; border-bottom:1px dashed #eee; padding-bottom:4px;">INDUSTRY CATEGORY BREAKDOWN</h5>
        <table class="datatable" style="font-size:0.75rem;">
          <thead><tr><th>Exhibitor Sector Class</th><th>Total Profiles</th><th>Percent</th></tr></thead>
          <tbody>
            ${Object.keys(categoryBreakdown).map(k => `
              <tr><td><strong>${k}</strong></td><td>${categoryBreakdown[k]}</td><td>${((categoryBreakdown[k]/exhCount)*100).toFixed(1)}%</td></tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (activeReportTab === 'revenue') {
    title.textContent = 'Event Cash Revenue Ledger';
    
    let totalBoothExpected = 0;
    let totalBoothPaid = 0;
    let totalSponsorFunding = 0;

    db.payments.forEach(p => {
      totalBoothExpected += p.total;
      totalBoothPaid += p.paid;
    });

    db.sponsors.forEach(s => {
      if (s.status === 'confirmed' || s.status === 'paid') {
        totalSponsorFunding += s.amount * 1.18; // normalize
      }
    });

    const netExpected = totalBoothExpected + totalSponsorFunding;
    const netCollected = totalBoothPaid + totalSponsorFunding;

    html = `
      <div style="margin-bottom:1.5rem;">
        <h5 style="font-weight:700; margin-bottom:8px; border-bottom:1px dashed #eee; padding-bottom:4px;">REVENUE ACQUISITION SPECIFICATIONS</h5>
        <table class="datatable" style="font-size:0.75rem;">
          <thead><tr><th>Collection Ledger</th><th>Gross Expected</th><th>Total Collected</th><th>Pending Deficit</th></tr></thead>
          <tbody>
            <tr><td><strong>Exhibition Stalls (Inc GST)</strong></td><td>₹${totalBoothExpected.toLocaleString()}</td><td>₹${totalBoothPaid.toLocaleString()}</td><td style="color:var(--status-sold);">₹${(totalBoothExpected - totalBoothPaid).toLocaleString()}</td></tr>
            <tr><td><strong>Corporate Sponsors (Inc GST)</strong></td><td>₹${totalSponsorFunding.toLocaleString()}</td><td>₹${totalSponsorFunding.toLocaleString()}</td><td>₹0</td></tr>
            <tr style="background:var(--bg-section); font-weight:800;"><td><strong>GRAND NET TOTALS</strong></td><td>₹${netExpected.toLocaleString()}</td><td style="color:var(--status-available);">₹${netCollected.toLocaleString()}</td><td style="color:var(--status-sold);">₹${(netExpected - netCollected).toLocaleString()}</td></tr>
          </tbody>
        </table>
      </div>
    `;
  } else {
    // Lead Report
    title.textContent = 'CRM Leads Pipeline & Acquisition Audit';
    const total = db.leads.length;
    const statusCounts = {};
    db.leads.forEach(l => {
      statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
    });

    html = `
      <div style="margin-bottom:1.5rem;">
        <h5 style="font-weight:700; margin-bottom:8px; border-bottom:1px dashed #eee; padding-bottom:4px;">PIPELINE CONVERSION CONTEXT</h5>
        <table class="datatable" style="font-size:0.75rem;">
          <thead><tr><th>Leads Stage</th><th>Total Leads Count</th><th>Conversion Pct</th></tr></thead>
          <tbody>
            ${Object.keys(statusCounts).map(k => `
              <tr><td><strong>${k.replace('_', ' ').toUpperCase()}</strong></td><td>${statusCounts[k]}</td><td>${((statusCounts[k]/total)*100).toFixed(1)}%</td></tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  details.innerHTML = html;
}

function triggerReportPrint() {
  window.print();
}

function triggerReportExportCSV() {
  exportModuleData(activeReportTab === 'visitor' ? 'visitors' : activeReportTab === 'sponsor' ? 'sponsors' : activeReportTab === 'revenue' ? 'payments' : 'leads');
}


// ── WEBSITE CONTENT MANAGER ENGINE ──
function populateContentEditorForm() {
  document.getElementById('site-edit-hero-title').value = db.settings?.ire_content_hero_title || 'India Renewable<br>Energy <span>Expo 2026</span>';
  document.getElementById('site-edit-about-text').value = db.settings?.ire_content_about_text || '';
}

async function saveWebsiteContentManager(e) {
  e.preventDefault();
  const inHero = document.getElementById('site-edit-hero-title').value.trim();
  const inAbout = document.getElementById('site-edit-about-text').value.trim();

  if (!inHero || !inAbout) {
    alert('Hero Title and About Text are required fields.');
    return;
  }

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ire_content_hero_title: inHero,
        ire_content_about_text: inAbout
      })
    });
    if (res.ok) {
      logActivity(`Website frontpage content blocks updated via Site Manager.`);
      showToast('🏢 Web content updated successfully.');
      await syncRamData();
    } else {
      showToast('❌ Failed to update content');
    }
  } catch (err) {
    console.error('Error saving content settings:', err);
    showToast('❌ Failed to update content');
  }
}

function populateRegSettingsForm() {
  document.getElementById('set-reg-open').checked = db.settings?.ire_reg_open !== 'false';
  document.getElementById('set-reg-limit').value = db.settings?.ire_reg_limit || '5000';
  document.getElementById('set-reg-approval').checked = db.settings?.ire_reg_approval === 'true';
  document.getElementById('set-reg-qr').checked = db.settings?.ire_reg_qr !== 'false';
  document.getElementById('set-reg-email').checked = db.settings?.ire_reg_email !== 'false';
}

async function savePublicRegSettings(e) {
  e.preventDefault();
  const open = document.getElementById('set-reg-open').checked;
  const limit = document.getElementById('set-reg-limit').value;
  const approval = document.getElementById('set-reg-approval').checked;
  const qr = document.getElementById('set-reg-qr').checked;
  const email = document.getElementById('set-reg-email').checked;

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ire_reg_open: String(open),
        ire_reg_limit: String(limit),
        ire_reg_approval: String(approval),
        ire_reg_qr: String(qr),
        ire_reg_email: String(email)
      })
    });
    if (res.ok) {
      logActivity(`Public registration settings modified.`);
      showToast('⚙️ Public settings saved.');
      await syncRamData();
    } else {
      showToast('❌ Failed to save settings');
    }
  } catch (err) {
    console.error('Error saving settings:', err);
    showToast('❌ Failed to save settings');
  }
}


// ── GLOBAL SEARCH ENGINE (PULLS MATCHES ACROSS ALL SCHEMAS) ──
function handleGlobalSearch(val) {
  const dropdown = document.getElementById('global-search-dropdown');
  if (!dropdown) return;

  const query = val.toLowerCase().trim();
  if (!query) {
    dropdown.style.display = 'none';
    return;
  }

  const results = {
    stalls: [],
    leads: [],
    exhibitors: [],
    visitors: [],
    sponsors: []
  };

  // 1. Stalls
  db.stalls.forEach(s => {
    if (s.id.toLowerCase().includes(query) || (s.assigned_company && s.assigned_company.toLowerCase().includes(query))) {
      results.stalls.push(s);
    }
  });

  // 2. Leads
  db.leads.forEach(l => {
    if (l.company.toLowerCase().includes(query) || l.contact_person.toLowerCase().includes(query)) {
      results.leads.push(l);
    }
  });

  // 3. Exhibitors
  db.exhibitors.forEach(e => {
    if (e.company.toLowerCase().includes(query) || e.contact_person.toLowerCase().includes(query)) {
      results.exhibitors.push(e);
    }
  });

  // 4. Visitors
  db.visitors.forEach(v => {
    if (v.name.toLowerCase().includes(query) || v.company.toLowerCase().includes(query) || v.id.toLowerCase().includes(query)) {
      results.visitors.push(v);
    }
  });

  // 5. Sponsors
  db.sponsors.forEach(s => {
    if (s.company.toLowerCase().includes(query) || s.type.toLowerCase().includes(query)) {
      results.sponsors.push(s);
    }
  });

  const totalResults = results.stalls.length + results.leads.length + results.exhibitors.length + results.visitors.length + results.sponsors.length;
  if (totalResults === 0) {
    dropdown.innerHTML = '<div style="padding:10px; font-size:0.72rem; color:var(--text-muted); text-align:center;">No matching records found.</div>';
    dropdown.style.display = 'block';
    return;
  }

  let html = '';
  if (results.stalls.length > 0) {
    html += '<div class="search-group-title">Stalls Grid</div>';
    html += results.stalls.slice(0, 3).map(s => `
      <div class="search-item" onclick="jumpToSearchResult('stalls', '${s.id}')">
        <div>
          <span class="lbl">Stall ${s.id}</span>
          <div class="sub">${s.assigned_company || 'Available'} | Block ${s.block}</div>
        </div>
        <span class="tag" style="background:var(--border-cu); color:var(--text);">${s.status}</span>
      </div>
    `).join('');
  }

  if (results.leads.length > 0) {
    html += '<div class="search-group-title">CRM Leads</div>';
    html += results.leads.slice(0, 3).map(l => `
      <div class="search-item" onclick="jumpToSearchResult('leads', '${l.id}')">
        <div>
          <span class="lbl">${l.company}</span>
          <div class="sub">Contact: ${l.contact_person} (${l.segment})</div>
        </div>
        <span class="tag" style="background:#fff3e0; color:#f57c00;">${l.status}</span>
      </div>
    `).join('');
  }

  if (results.exhibitors.length > 0) {
    html += '<div class="search-group-title">Confirmed Exhibitors</div>';
    html += results.exhibitors.slice(0, 3).map(e => `
      <div class="search-item" onclick="jumpToSearchResult('exhibitors', '${e.id}')">
        <div>
          <span class="lbl">${e.company}</span>
          <div class="sub">Stall: ${e.assigned_stall}</div>
        </div>
        <span class="tag" style="background:#e8f5e9; color:#111111;">active</span>
      </div>
    `).join('');
  }

  if (results.visitors.length > 0) {
    html += '<div class="search-group-title">Visitor Passes</div>';
    html += results.visitors.slice(0, 3).map(v => `
      <div class="search-item" onclick="jumpToSearchResult('visitors', '${v.id}')">
        <div>
          <span class="lbl">${v.name}</span>
          <div class="sub">${v.company} (${v.id})</div>
        </div>
        <span class="tag" style="background:#e3f2fd; color:#1565c0;">${v.status}</span>
      </div>
    `).join('');
  }

  if (results.sponsors.length > 0) {
    html += '<div class="search-group-title">Corporate Sponsors</div>';
    html += results.sponsors.slice(0, 3).map(s => `
      <div class="search-item" onclick="jumpToSearchResult('sponsors', '${s.id}')">
        <div>
          <span class="lbl">${s.company}</span>
          <div class="sub">Tier: ${s.type}</div>
        </div>
        <span class="tag" style="background:var(--border-cu); color:var(--copper);">${s.status}</span>
      </div>
    `).join('');
  }

  dropdown.innerHTML = html;
  dropdown.style.display = 'block';
}

function jumpToSearchResult(tabId, itemId) {
  document.getElementById('global-search-dropdown').style.display = 'none';
  document.getElementById('global-search-input').value = '';

  const navBtn = document.querySelector(`.sidebar-menu-btn[onclick*="${tabId}"]`);
  switchView(tabId, navBtn);

  if (tabId === 'stalls') openStallModal(itemId);
  else if (tabId === 'leads') openLeadModal(itemId);
  else if (tabId === 'exhibitors') openExhibitorModal(itemId);
  else if (tabId === 'visitors') showVisitorQRPass(itemId);
  else if (tabId === 'sponsors') openSponsorModal(itemId);
}

// ── PHASE 3 COMPREHENSIVE ADDITIONS ──

let selectedAdminStallId = null;
let activeExhibitorCompany = '';

// ── Sidebar Toggle function for mobile drawer ──
function toggleSidebar(isOpen) {
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) {
    if (isOpen) {
      sidebar.classList.add('open');
    } else {
      sidebar.classList.remove('open');
    }
  }
  if (overlay) {
    if (isOpen) {
      overlay.classList.add('active');
    } else {
      overlay.classList.remove('active');
    }
  }
}

// ── Tab Switcher view function ──
async function switchView(viewId, element) {
  // Automatically close sidebar drawer on navigation selection (mobile)
  toggleSidebar(false);

  // Hide all view panes
  const panes = document.querySelectorAll('.view-pane');
  panes.forEach(p => p.classList.remove('active'));

  // Show selected pane
  const pane = document.getElementById('view-' + viewId);
  if (pane) pane.classList.add('active');

  // Reset active buttons in sidebar
  const buttons = document.querySelectorAll('.sidebar-menu-btn');
  buttons.forEach(b => b.classList.remove('active'));

  // Set clicked button to active
  if (element) element.classList.add('active');

  currentActiveView = viewId;

  // Fetch fresh data from backend
  await syncRamData();

  // Render content dynamically on tab activation
  if (viewId === 'dashboard') {
    refreshDashboardMetrics();
  } else if (viewId === 'stalls') {
    renderStallsTable();
  } else if (viewId === 'map') {
    renderAdminMapSVG();
  } else if (viewId === 'leads') {
    renderLeadsTable();
  } else if (viewId === 'exhibitors') {
    renderExhibitorsTable();
  } else if (viewId === 'payments') {
    renderPaymentsTable();
  } else if (viewId === 'visitors') {
    renderVisitorsTable();
  } else if (viewId === 'sponsors') {
    renderSponsorsTable();
  } else if (viewId === 'sponsor-apps') {
    renderSponsorAppsTable();
  } else if (viewId === 'tasks') {
    renderTasksTable();
  } else if (viewId === 'exhibitor-portal') {
    renderExhibitorPortal();
  }
}

// ── Toast Alert Helper ──
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.innerHTML = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── Modal overlay helper functions ──
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

// ── Stall Inventory render table ──
function renderStallsTable() {
  const blockF = document.getElementById('stall-filter-block') ? document.getElementById('stall-filter-block').value : '';
  const statusF = document.getElementById('stall-filter-status') ? document.getElementById('stall-filter-status').value : '';
  const searchF = document.getElementById('stall-search-company') ? document.getElementById('stall-search-company').value.toLowerCase().trim() : '';

  let filtered = db.stalls.filter(s => {
    if (blockF && s.block !== blockF) return false;
    if (statusF && s.status !== statusF) return false;
    if (searchF) {
      const comp = s.assigned_company ? s.assigned_company.toLowerCase() : '';
      if (!comp.includes(searchF) && !s.id.toLowerCase().includes(searchF)) return false;
    }
    return true;
  });

  const countEl = document.getElementById('stall-table-count');
  if (countEl) countEl.textContent = `${filtered.length} Stalls matching`;

  const tbody = document.getElementById('stalls-table-body');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--text-muted);">No stalls found matching criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    let statusClass = s.status;
    let actionsHtml = `
      <div style="display:flex; gap:4px; justify-content:center;">
        <button class="btn-action-outline" style="font-size:10px; padding:2px 6px;" onclick="inspectStall('${s.id}')">🔍 Inspect</button>
    `;
    if (activeRole === 'super_admin' || activeRole === 'admin' || activeRole === 'finance_manager') {
      if (s.status === 'under_review' || s.status === 'submitted' || s.status === 'payment_pending') {
        actionsHtml += `<button class="btn-action-outline" style="font-size:10px; padding:2px 6px; color:var(--status-available);" onclick="changeStallStatus('${s.id}', 'sold')">✅ Approve</button>`;
        actionsHtml += `<button class="btn-action-outline" style="font-size:10px; padding:2px 6px; color:var(--status-sold);" onclick="changeStallStatus('${s.id}', 'available')">❌ Reject</button>`;
      } else if (s.status === 'available') {
        actionsHtml += `<button class="btn-action-outline" style="font-size:10px; padding:2px 6px; color:var(--status-reserved);" onclick="changeStallStatus('${s.id}', 'reserved')">🔒 Reserve</button>`;
      } else if (s.status === 'reserved') {
        actionsHtml += `<button class="btn-action-outline" style="font-size:10px; padding:2px 6px; color:var(--status-available);" onclick="changeStallStatus('${s.id}', 'available')">🔓 Release</button>`;
      }
    }
    actionsHtml += `</div>`;

    return `
      <tr>
        <td><strong>Stall ${s.id}</strong></td>
        <td>Block ${s.block}</td>
        <td><span class="category-badge">${s.category}</span></td>
        <td>${s.size}</td>
        <td>₹${s.price.toLocaleString('en-IN')}</td>
        <td><span class="status-badge ${statusClass}">${s.status.toUpperCase().replace('_', ' ')}</span></td>
        <td style="color:var(--copper); font-weight:700;">${s.assigned_company || '—'}</td>
        <td>${actionsHtml}</td>
      </tr>
    `;
  }).join('');
}

function inspectStall(stallId) {
  const navBtn = document.getElementById('nav-btn-map');
  switchView('map', navBtn);
  inspectStallDetails(stallId);
}

// ── Interactive SVG Floor plan builder ──
function renderAdminMapSVG() {
  const svg = document.getElementById('admin-map-svg');
  if (!svg) return;

  let html = `<g id="admin-viewport">`;
  
  // Background grid & hall border
  html += `
    <defs>
      <pattern id="adminGridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0,0,0, 0.05)" stroke-width="0.5"/>
      </pattern>
    </defs>
    <rect width="900" height="800" fill="url(#adminGridPattern)"/>
    <rect x="5" y="5" width="890" height="790" fill="none" stroke="var(--border)" stroke-width="2" rx="10"/>
    <rect x="9" y="9" width="882" height="782" fill="none" stroke="var(--border)" stroke-width="1" rx="8"/>
    
    <!-- Corridors -->
    <rect x="90" y="380" width="720" height="40" fill="rgba(242,68,5, 0.04)"/>
    <line x1="90" y1="400" x2="810" y2="400" stroke="var(--border)" stroke-dasharray="2 2"/>
    <text x="450" y="403" fill="var(--text-muted)" font-size="9px" font-weight="700" text-anchor="middle">4m Visitor Corridor</text>

    <rect x="90" y="110" width="720" height="30" fill="rgba(242,68,5, 0.02)"/>
    <rect x="90" y="670" width="720" height="30" fill="rgba(242,68,5, 0.02)"/>
    <rect x="90" y="140" width="30" height="530" fill="rgba(242,68,5, 0.02)"/>
    <rect x="780" y="140" width="30" height="530" fill="rgba(242,68,5, 0.02)"/>
    
    <!-- Main Stage -->
    <g transform="translate(370, 715)">
      <rect x="0" y="0" width="160" height="50" fill="rgba(0, 203, 198, 0.08)" stroke="var(--status-pending)" stroke-dasharray="4 2" stroke-width="1" rx="6"/>
      <text x="80" y="24" fill="var(--status-pending)" font-size="10px" font-weight="700" text-anchor="middle">MAIN STAGE</text>
      <text x="80" y="38" fill="var(--text-muted)" font-size="7.5px" text-anchor="middle">6.1m × 6.1m (400 SFT)</text>
    </g>

    <!-- Food Court -->
    <g transform="translate(20, 715)">
      <rect x="0" y="0" width="150" height="50" fill="rgba(0,0,0, 0.03)" stroke="var(--border)" stroke-width="1" rx="6"/>
      <text x="75" y="24" fill="var(--text-dim)" font-size="10px" font-weight="700" text-anchor="middle">🍲 FOOD COURT</text>
      <text x="75" y="38" fill="var(--text-muted)" font-size="7.5px" text-anchor="middle">Visitor Amenities</text>
    </g>
  `;

  // Draw Block A (Top Wall, A-1 to A-10)
  const aWidth = 880 / 10;
  for (let i = 0; i < 10; i++) {
    const s = db.stalls.find(x => x.id === `A-${i+1}`);
    if (s) html += getStallSvgElement(10 + i * aWidth, 10, aWidth - 4, 57, s);
  }

  // Draw Block B (Left Wall, B-1 to B-18)
  const bHeight = 600 / 18;
  for (let i = 0; i < 18; i++) {
    const s = db.stalls.find(x => x.id === `B-${i+1}`);
    if (s) html += getStallSvgElement(10, 100 + i * bHeight, 80 - 4, bHeight - 3, s);
  }

  // Draw Block C (Right Wall, C-1 to C-12)
  const cHeight = 600 / 12;
  for (let i = 0; i < 12; i++) {
    const s = db.stalls.find(x => x.id === `C-${i+1}`);
    if (s) html += getStallSvgElement(810, 100 + i * cHeight, 80 - 4, cHeight - 4, s);
  }

  // Draw Block D (Centre Floor Units D-1 to D-6)
  const dWidth = 160;
  const dHeight = 180;
  const colGaps = 50;
  const rowGap = 70;
  const unitPositions = [
    { x: 160, y: 160 },
    { x: 160 + dWidth + colGaps, y: 160 },
    { x: 160 + (dWidth + colGaps)*2, y: 160 },
    { x: 160, y: 160 + dHeight + rowGap },
    { x: 160 + dWidth + colGaps, y: 160 + dHeight + rowGap },
    { x: 160 + (dWidth + colGaps)*2, y: 160 + dHeight + rowGap }
  ];
  unitPositions.forEach((pos, idx) => {
    const unitNum = idx + 1;
    html += `<rect x="${pos.x - 4}" y="${pos.y - 4}" width="${dWidth + 8}" height="${dHeight + 8}" fill="none" stroke="rgba(242,135,5, 0.15)" stroke-width="1" rx="4"/>`;
    html += `<text x="${pos.x + dWidth/2}" y="${pos.y - 8}" fill="rgba(242,135,5, 0.6)" font-size="7.5px" font-weight="800" text-anchor="middle">CLUSTER D-${unitNum}</text>`;
    
    const subW = dWidth / 2;
    const subH = dHeight / 3;
    const subStalls = [
      { l: 'a', dx: 0, dy: 0 },
      { l: 'b', dx: subW, dy: 0 },
      { l: 'c', dx: 0, dy: subH },
      { l: 'd', dx: subW, dy: subH },
      { l: 'e', dx: 0, dy: subH * 2 },
      { l: 'f', dx: subW, dy: subH * 2 }
    ];
    subStalls.forEach(sub => {
      const s = db.stalls.find(x => x.id === `D-${unitNum}-${sub.l}`);
      if (s) html += getStallSvgElement(pos.x + sub.dx, pos.y + sub.dy, subW - 3, subH - 3, s);
    });
  });

  // Draw Block E (VIP Lounge & 9 VIP Stalls E-1 to E-9)
  html += `
    <rect x="645" y="710" width="240" height="60" fill="rgba(0, 203, 198, 0.03)" stroke="rgba(0, 203, 198, 0.2)" stroke-width="1.5" rx="6"/>
    <text x="765" y="705" fill="var(--copper)" font-size="8px" font-weight="800" text-anchor="middle">VIP LOUNGE ZONE (BLOCK E)</text>
  `;
  const eWidth = 230 / 9;
  for (let i = 0; i < 9; i++) {
    const s = db.stalls.find(x => x.id === `E-${i+1}`);
    if (s) html += getStallSvgElement(650 + i * eWidth, 715, eWidth - 2, 50, s);
  }

  html += `</g>`;
  svg.innerHTML = html;

  // Apply Scale
  const viewport = document.getElementById('admin-viewport');
  if (viewport) {
    viewport.setAttribute('transform', `scale(${adminMapScale})`);
  }
}

function getStallSvgElement(x, y, w, h, s) {
  let color = 'var(--status-available)';
  if (s.status === 'sold') color = 'var(--status-sold)';
  else if (s.status === 'reserved') color = 'var(--status-reserved)';
  else if (s.status === 'payment_pending' || s.status === 'under_review' || s.status === 'submitted') color = 'var(--status-pending)';

  let strokeColor = 'rgba(0,0,0,0.1)';
  let strokeWidth = '1';
  if (selectedAdminStallId === s.id) {
    strokeColor = 'var(--copper)';
    strokeWidth = '2.5';
  }

  let fontSize = '7px';
  if (w < 20) fontSize = '5px';
  else if (w < 35) fontSize = '6.5px';

  return `
    <g style="cursor:pointer;" onclick="inspectStallDetails('${s.id}')">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}" rx="2"/>
      <text x="${x + w/2}" y="${y + h/2 + 2}" fill="#fff" font-size="${fontSize}" font-weight="700" text-anchor="middle">${s.id}</text>
    </g>
  `;
}

// ── Zoom/Pan Map Controllers ──
function zoomAdminMap(factor) {
  adminMapScale *= factor;
  applyAdminMapTransform();
}
function resetAdminMapZoom() {
  adminMapScale = 1;
  applyAdminMapTransform();
}
function applyAdminMapTransform() {
  const viewport = document.getElementById('admin-viewport');
  if (viewport) {
    viewport.setAttribute('transform', `scale(${adminMapScale})`);
  }
}

// ── Map Inspector Detail ──
function inspectStallDetails(sId) {
  selectedAdminStallId = sId;
  renderAdminMapSVG(); // redraw map to update selections
  
  const s = db.stalls.find(x => x.id === sId);
  const placeholder = document.getElementById('inspector-placeholder');
  const body = document.getElementById('inspector-body');
  
  if (!s) {
    if (placeholder) placeholder.style.display = 'block';
    if (body) body.style.display = 'none';
    return;
  }
  
  if (placeholder) placeholder.style.display = 'none';
  if (body) body.style.display = 'block';
  
  document.getElementById('inspector-stall-id').textContent = s.id;
  
  const statusBadge = document.getElementById('inspector-status-badge');
  statusBadge.className = 'status-badge ' + s.status;
  statusBadge.textContent = s.status.toUpperCase().replace('_', ' ');
  
  document.getElementById('inspector-block').textContent = 'Block ' + s.block;
  document.getElementById('inspector-category').textContent = s.category;
  document.getElementById('inspector-size').textContent = s.size;
  document.getElementById('inspector-price').textContent = '₹' + s.price.toLocaleString('en-IN');
  document.getElementById('inspector-company').textContent = s.assigned_company || 'None (Unassigned)';
  
  const actionsContainer = document.getElementById('inspector-actions');
  if (actionsContainer) {
    let actionsHtml = '';
    if (activeRole === 'super_admin' || activeRole === 'admin' || activeRole === 'finance_manager') {
      if (s.status === 'available') {
        actionsHtml += `
          <button class="btn-action-primary" style="font-size:11px; padding:6px 12px;" onclick="changeStallStatus('${s.id}', 'reserved')">🔒 Reserve Stall</button>
          <button class="btn-action-outline" style="font-size:11px; padding:6px 12px;" onclick="openAssignCompanyModal('${s.id}')">🤝 Sell / Assign</button>
        `;
      } else if (s.status === 'reserved') {
        actionsHtml += `
          <button class="btn-action-primary" style="font-size:11px; padding:6px 12px;" onclick="changeStallStatus('${s.id}', 'available')">🔓 Release Stall</button>
        `;
      } else if (s.status === 'sold') {
        actionsHtml += `
          <button class="btn-action-outline" style="font-size:11px; padding:6px 12px; color:var(--status-sold);" onclick="changeStallStatus('${s.id}', 'available')">❌ Mark Available</button>
        `;
      } else if (s.status === 'payment_pending' || s.status === 'under_review' || s.status === 'submitted') {
        actionsHtml += `
          <button class="btn-action-primary" style="font-size:11px; padding:6px 12px; background:var(--status-available);" onclick="changeStallStatus('${s.id}', 'sold')">✅ Approve Booking</button>
          <button class="btn-action-outline" style="font-size:11px; padding:6px 12px; color:var(--status-sold);" onclick="changeStallStatus('${s.id}', 'available')">❌ Reject & Release</button>
        `;
      }
    } else {
      actionsHtml = `<em style="font-size:0.75rem; color:var(--text-muted);">View-only access for current role.</em>`;
    }
    actionsContainer.innerHTML = actionsHtml;
  }
}

function changeStallStatus(stallId, newStatus) {
  let stalls = JSON.parse(localStorage.getItem(DB_STALLS)) || [];
  const idx = stalls.findIndex(s => s.id === stallId);
  if (idx !== -1) {
    const prevStatus = stalls[idx].status;
    stalls[idx].status = newStatus;
    if (newStatus === 'available') {
      stalls[idx].assigned_company = null;
    } else if (newStatus === 'reserved') {
      stalls[idx].assigned_company = 'IRE VIP Reserved';
    }
    localStorage.setItem(DB_STALLS, JSON.stringify(stalls));
    
    logActivity(`Stall ${stallId} status changed from ${prevStatus} to ${newStatus}.`);
    syncRamData();
    renderStallsTable();
    renderAdminMapSVG();
    inspectStallDetails(stallId);
    showToast(`Stall ${stallId} updated to ${newStatus}.`);
  }
}

function openAssignCompanyModal(stallId) {
  const companyName = prompt(`Enter company name to assign to Stall ${stallId}:`);
  if (companyName && companyName.trim()) {
    assignStallCompany(stallId, companyName.trim());
  }
}

function assignStallCompany(stallId, company) {
  let stalls = JSON.parse(localStorage.getItem(DB_STALLS)) || [];
  const idx = stalls.findIndex(s => s.id === stallId);
  if (idx !== -1) {
    stalls[idx].status = 'sold';
    stalls[idx].assigned_company = company;
    localStorage.setItem(DB_STALLS, JSON.stringify(stalls));
    
    let exhibitors = JSON.parse(localStorage.getItem(DB_EXHIBITORS)) || [];
    let ex = exhibitors.find(e => e.company.toLowerCase() === company.toLowerCase());
    if (!ex) {
      exhibitors.push({
        id: 'ex-' + Date.now(),
        company: company,
        contact_person: 'Corporate Rep',
        phone: '9999999999',
        email: 'info@' + company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
        category: stalls[idx].category + ' EPC Partner',
        assigned_stall: stallId,
        documents: [],
        status: 'active'
      });
      localStorage.setItem(DB_EXHIBITORS, JSON.stringify(exhibitors));
    }
    
    let payments = JSON.parse(localStorage.getItem(DB_PAYMENTS)) || [];
    let p = payments.find(pay => pay.company.toLowerCase() === company.toLowerCase() && pay.stall_number === stallId);
    if (!p) {
      let base = stalls[idx].price;
      let gst = Math.round(base * 0.18);
      payments.push({
        id: 'p-' + Date.now(),
        company: company,
        stall_number: stallId,
        amount: base,
        gst: gst,
        total: base + gst,
        paid: base + gst,
        pending: 0,
        due_date: new Date().toISOString().split('T')[0],
        status: 'paid',
        history: [{
          date: new Date().toISOString().split('T')[0],
          amount: base + gst,
          method: 'Admin Assignment',
          ref: 'TXN-' + Math.floor(100000 + Math.random()*900000)
        }]
      });
      localStorage.setItem(DB_PAYMENTS, JSON.stringify(payments));
    }
    
    logActivity(`Stall ${stallId} assigned to ${company} by Admin.`);
    syncRamData();
    renderStallsTable();
    renderAdminMapSVG();
    inspectStallDetails(stallId);
    showToast(`Stall ${stallId} assigned successfully.`);
  }
}

// ── Leads pipeline controller ──
function calculateLeadScore(lead) {
  let scorePoints = 0;
  if (['Solar PV', 'Electric Vehicles', 'BESS'].includes(lead.segment)) scorePoints += 3;
  if (['Referral', 'Direct Call'].includes(lead.source)) scorePoints += 2;
  if (lead.notes && lead.notes.length > 50) scorePoints += 1;
  return scorePoints >= 5 ? 'Hot' : scorePoints >= 3 ? 'Warm' : 'Cold';
}

function renderLeadsTable() {
  const statusF = document.getElementById('lead-filter-status') ? document.getElementById('lead-filter-status').value : '';
  const segmentF = document.getElementById('lead-filter-segment') ? document.getElementById('lead-filter-segment').value : '';
  const queryF = document.getElementById('lead-search-query') ? document.getElementById('lead-search-query').value.toLowerCase().trim() : '';

  let filtered = db.leads.filter(l => {
    if (statusF && l.status !== statusF) return false;
    if (segmentF && l.segment !== segmentF) return false;
    if (queryF) {
      const company = l.company.toLowerCase();
      const contact = l.contact_person.toLowerCase();
      if (!company.includes(queryF) && !contact.includes(queryF)) return false;
    }
    return true;
  });

  const countEl = document.getElementById('lead-table-count');
  if (countEl) countEl.textContent = `${filtered.length} Leads matching`;

  const tbody = document.getElementById('leads-table-body');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:2rem; color:var(--text-muted);">No leads found matching criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(l => {
    let actionsHtml = `
      <div style="display:flex; gap:4px; justify-content:center;">
        <button class="btn-action-outline" style="font-size:10px; padding:2px 6px;" onclick="openLeadModal('${l.id}')">✏️ Edit</button>
        <button class="btn-action-outline" style="font-size:10px; padding:2px 6px;" onclick="viewCrmTimeline('${l.company}')">🕒 Timeline</button>
    `;
    if (l.status !== 'confirmed') {
      actionsHtml += `<button class="btn-action-outline" style="font-size:10px; padding:2px 6px; color:var(--copper);" onclick="openConvertModal('${l.id}')">🔄 Convert</button>`;
    }
    if (activeRole === 'super_admin') {
      actionsHtml += `<button class="btn-action-outline" style="font-size:10px; padding:2px 6px; color:var(--status-sold);" onclick="deleteLead('${l.id}')">🗑️ Delete</button>`;
    }
    actionsHtml += `</div>`;

    if (!l.lead_score) {
      l.lead_score = calculateLeadScore(l);
    }
    let scoreEmoji = l.lead_score === 'Hot' ? '🔥' : l.lead_score === 'Warm' ? '☀️' : '❄️';

    return `
      <tr>
        <td><strong>${l.company}</strong> <span style="font-size:11px;" title="${l.lead_score} Lead">${scoreEmoji}</span></td>
        <td><span class="category-badge">${l.segment}</span></td>
        <td>${l.contact_person}</td>
        <td><span style="font-size:10px;">📞 ${l.phone}<br>✉️ ${l.email}</span></td>
        <td>${l.city}, ${l.state}</td>
        <td>${l.assigned_to}</td>
        <td>${l.source}</td>
        <td><span class="status-badge ${l.status}">${l.status.toUpperCase().replace('_', ' ')}</span></td>
        <td>${actionsHtml}</td>
      </tr>
    `;
  }).join('');
}

function openLeadModal(leadId) {
  const hiddenId = document.getElementById('lead-modal-id-hidden');
  const title = document.getElementById('lead-modal-title');
  const inCompany = document.getElementById('lead-company-input');
  const inSegment = document.getElementById('lead-segment-input');
  const inContact = document.getElementById('lead-contact-input');
  const inPhone = document.getElementById('lead-phone-input');
  const inEmail = document.getElementById('lead-email-input');
  const inSource = document.getElementById('lead-source-input');
  const inCity = document.getElementById('lead-city-input');
  const inState = document.getElementById('lead-state-input');
  const inOwner = document.getElementById('lead-owner-input');
  const inStatus = document.getElementById('lead-status-input');
  const inNotes = document.getElementById('lead-notes-input');

  document.getElementById('lead-modal-form').reset();
  hiddenId.value = '';

  if (leadId) {
    const l = db.leads.find(x => x.id === leadId);
    if (l) {
      title.textContent = 'Edit Lead Profile';
      hiddenId.value = l.id;
      inCompany.value = l.company;
      inSegment.value = l.segment;
      inContact.value = l.contact_person;
      inPhone.value = l.phone;
      inEmail.value = l.email;
      inSource.value = l.source;
      inCity.value = l.city;
      inState.value = l.state;
      inOwner.value = l.assigned_to;
      inStatus.value = l.status;
      inNotes.value = l.notes || '';
    }
  } else {
    title.textContent = 'Add New Business Lead';
  }

  openModal('modal-lead');
}

function submitLeadForm(e) {
  e.preventDefault();
  const hiddenId = document.getElementById('lead-modal-id-hidden').value;
  const inCompany = document.getElementById('lead-company-input').value.trim();
  const inSegment = document.getElementById('lead-segment-input').value;
  const inContact = document.getElementById('lead-contact-input').value.trim();
  const inPhone = document.getElementById('lead-phone-input').value.trim();
  const inEmail = document.getElementById('lead-email-input').value.trim();
  const inSource = document.getElementById('lead-source-input').value;
  const inCity = document.getElementById('lead-city-input').value.trim();
  const inState = document.getElementById('lead-state-input').value.trim();
  const inOwner = document.getElementById('lead-owner-input').value;
  const inStatus = document.getElementById('lead-status-input').value;
  const inNotes = document.getElementById('lead-notes-input').value.trim();

  if (!inCompany || !inContact || !inPhone || !inEmail || !inCity || !inState) {
    alert('Please fill out all required fields.');
    return;
  }

  if (hiddenId) {
    const idx = db.leads.findIndex(l => l.id === hiddenId);
    if (idx !== -1) {
      const oldStatus = db.leads[idx].status;
      db.leads[idx].company = inCompany;
      db.leads[idx].segment = inSegment;
      db.leads[idx].contact_person = inContact;
      db.leads[idx].phone = inPhone;
      db.leads[idx].email = inEmail;
      db.leads[idx].source = inSource;
      db.leads[idx].city = inCity;
      db.leads[idx].state = inState;
      db.leads[idx].assigned_to = inOwner;
      db.leads[idx].status = inStatus;
      db.leads[idx].notes = inNotes;
      db.leads[idx].lead_score = calculateLeadScore(db.leads[idx]);
      logActivity(`Lead company <strong>${inCompany}</strong> profile updated.`);

      if (oldStatus !== inStatus) {
        addCrmTimelineEntry(inCompany, 'call', `Lead pipeline stage updated to ${inStatus.toUpperCase()}. Notes: ${inNotes}`);
      }
    }
  } else {
    const newLead = {
      id: 'l-' + Date.now(),
      company: inCompany,
      segment: inSegment,
      contact_person: inContact,
      phone: inPhone,
      email: inEmail,
      source: inSource,
      city: inCity,
      state: inState,
      assigned_to: inOwner,
      status: inStatus,
      notes: inNotes
    };
    newLead.lead_score = calculateLeadScore(newLead);
    db.leads.push(newLead);
    logActivity(`New Business Lead <strong>${inCompany}</strong> registered manually.`);
    addCrmTimelineEntry(inCompany, 'call', `Initial Lead added to pipeline. Assigned Owner: ${inOwner}.`);
  }

  commitLocalDatabase(DB_LEADS, db.leads);
  closeModal('modal-lead');
  renderLeadsTable();
  showToast('💾 Leads database synchronized.');
}

function deleteLead(leadId) {
  if (confirm('Are you sure you want to delete this lead?')) {
    const idx = db.leads.findIndex(l => l.id === leadId);
    if (idx !== -1) {
      const company = db.leads[idx].company;
      db.leads.splice(idx, 1);
      commitLocalDatabase(DB_LEADS, db.leads);
      logActivity(`Lead company <strong>${company}</strong> profile deleted.`);
      renderLeadsTable();
      showToast('🗑️ Lead record removed.');
    }
  }
}

// ── Lead Conversion to Exhibitor ──
function openConvertModal(leadId) {
  const l = db.leads.find(x => x.id === leadId);
  if (!l) return;

  document.getElementById('convert-lead-id-hidden').value = l.id;
  document.getElementById('convert-company-display').value = l.company;
  document.getElementById('convert-gstin-input').value = '';
  document.getElementById('convert-category-input').value = 'Solar EPC Partner';

  const select = document.getElementById('convert-stall-input');
  let options = `<option value="">-- Select Available Stall --</option>`;
  db.stalls.forEach(s => {
    if (s.status === 'available') {
      options += `<option value="${s.id}">Stall ${s.id} (${s.block} - ${s.category} - ₹${s.price.toLocaleString()})</option>`;
    }
  });
  select.innerHTML = options;

  document.getElementById('convert-meta-size').textContent = '-';
  document.getElementById('convert-meta-price').textContent = '₹0.00';
  document.getElementById('convert-meta-total').textContent = '₹0.00';

  openModal('modal-convert');
}

function updateConvertPriceMeta(stallId) {
  const s = db.stalls.find(x => x.id === stallId);
  if (s) {
    document.getElementById('convert-meta-size').textContent = s.size;
    document.getElementById('convert-meta-price').textContent = '₹' + s.price.toLocaleString('en-IN');
    const total = s.price * 1.18;
    document.getElementById('convert-meta-total').textContent = '₹' + total.toLocaleString('en-IN');
  } else {
    document.getElementById('convert-meta-size').textContent = '-';
    document.getElementById('convert-meta-price').textContent = '₹0.00';
    document.getElementById('convert-meta-total').textContent = '₹0.00';
  }
}

function submitLeadConversion(e) {
  e.preventDefault();
  const leadId = document.getElementById('convert-lead-id-hidden').value;
  const gstin = document.getElementById('convert-gstin-input').value.trim();
  const category = document.getElementById('convert-category-input').value;
  const stallId = document.getElementById('convert-stall-input').value;

  if (!gstin || !stallId) {
    alert('Please fill out all required fields.');
    return;
  }

  const lIdx = db.leads.findIndex(x => x.id === leadId);
  if (lIdx === -1) return;

  const lead = db.leads[lIdx];
  lead.status = 'confirmed';
  lead.notes += `\nConverted to Confirmed Exhibitor. Assigned Stall: ${stallId}.`;
  commitLocalDatabase(DB_LEADS, db.leads);

  let exhibitors = JSON.parse(localStorage.getItem(DB_EXHIBITORS)) || [];
  exhibitors.push({
    id: 'ex-' + Date.now(),
    company: lead.company,
    gstin: gstin,
    contact_person: lead.contact_person,
    phone: lead.phone,
    email: lead.email,
    website: 'https://' + lead.company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
    category: category,
    assigned_stall: stallId,
    documents: [],
    status: 'active'
  });
  localStorage.setItem(DB_EXHIBITORS, JSON.stringify(exhibitors));

  let stalls = JSON.parse(localStorage.getItem(DB_STALLS)) || [];
  const sIdx = stalls.findIndex(s => s.id === stallId);
  if (sIdx !== -1) {
    stalls[sIdx].status = 'sold';
    stalls[sIdx].assigned_company = lead.company;
    localStorage.setItem(DB_STALLS, JSON.stringify(stalls));
  }

  let payments = JSON.parse(localStorage.getItem(DB_PAYMENTS)) || [];
  let base = stalls[sIdx].price;
  let gst = Math.round(base * 0.18);
  payments.push({
    id: 'p-' + Date.now(),
    company: lead.company,
    stall_number: stallId,
    amount: base,
    gst: gst,
    total: base + gst,
    paid: base + gst,
    pending: 0,
    due_date: new Date().toISOString().split('T')[0],
    status: 'paid',
    history: [{
      date: new Date().toISOString().split('T')[0],
      amount: base + gst,
      method: 'Lead Conversion Checkout',
      ref: 'TXN-' + Math.floor(100000 + Math.random()*900000)
    }]
  });
  localStorage.setItem(DB_PAYMENTS, JSON.stringify(payments));

  addCrmTimelineEntry(lead.company, 'payment', `Converted lead to Exhibitor. Assigned Stall ${stallId}. Received total amount ₹${(base + gst).toLocaleString()}.`);
  
  let autoLogs = JSON.parse(localStorage.getItem('ire_db_automation_logs')) || [];
  autoLogs.push({
    id: 'auto-' + Date.now() + '-1',
    type: 'email',
    trigger_event: 'Lead Converted',
    recipient: lead.email,
    message_body: `Dear ${lead.contact_person},\n\nWelcome to India Renewable Energy Expo 2026! Your lead profile has been upgraded to a Confirmed Exhibitor. You have been assigned Stall ${stallId}.\n\nBest regards,\nIRE Expo Team`,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('ire_db_automation_logs', JSON.stringify(autoLogs));

  logActivity(`Lead <strong>${lead.company}</strong> converted successfully to Exhibitor.`);
  closeModal('modal-convert');
  syncRamData();
  renderLeadsTable();
  renderExhibitorsTable();
  renderStallsTable();
  renderAdminMapSVG();
  renderPaymentsTable();
  showToast(`🎉 Lead converted to Exhibitor successfully!`);
}

// ── Exhibitors database controllers ──
function renderExhibitorsTable() {
  const queryF = document.getElementById('exh-search-query') ? document.getElementById('exh-search-query').value.toLowerCase().trim() : '';

  let filtered = db.exhibitors.filter(e => {
    if (queryF) {
      const company = e.company.toLowerCase();
      const contact = e.contact_person.toLowerCase();
      const email = e.email.toLowerCase();
      const stall = e.assigned_stall.toLowerCase();
      if (!company.includes(queryF) && !contact.includes(queryF) && !email.includes(queryF) && !stall.includes(queryF)) return false;
    }
    return true;
  });

  const countEl = document.getElementById('exh-table-count');
  if (countEl) countEl.textContent = `${filtered.length} Exhibitors found`;

  const tbody = document.getElementById('exhibitors-table-body');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:2rem; color:var(--text-muted);">No exhibitors found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(e => {
    let actionsHtml = `
      <div style="display:flex; gap:4px; justify-content:center;">
        <button class="btn-action-outline" style="font-size:10px; padding:2px 6px;" onclick="openExhibitorModal('${e.id}')">✏️ Edit</button>
        <button class="btn-action-outline" style="font-size:10px; padding:2px 6px;" onclick="viewCrmTimeline('${e.company}')">🕒 Timeline</button>
    `;
    if (activeRole === 'super_admin') {
      actionsHtml += `<button class="btn-action-outline" style="font-size:10px; padding:2px 6px; color:var(--status-sold);" onclick="deleteExhibitor('${e.id}')">🗑️ Delete</button>`;
    }
    actionsHtml += `</div>`;

    const docsText = e.documents && e.documents.length > 0 ? `📄 ${e.documents.length} File(s) Verified` : '❌ No documents';

    return `
      <tr>
        <td><strong>${e.company}</strong></td>
        <td><span style="font-family:monospace; font-size:10px;">${e.gstin}</span></td>
        <td><span style="font-size:10px;">👤 ${e.contact_person}<br>📞 ${e.phone}<br>✉️ ${e.email}</span></td>
        <td><span style="font-size:10px;">📍 ${e.address}<br>🌐 <a href="${e.website}" target="_blank" style="color:var(--copper);">${e.website}</a></span></td>
        <td><span class="category-badge">${e.category}</span></td>
        <td><span style="color:var(--copper); font-weight:700;">Stall ${e.assigned_stall}</span></td>
        <td>${docsText}</td>
        <td><span class="status-badge active">${e.status.toUpperCase()}</span></td>
        <td>${actionsHtml}</td>
      </tr>
    `;
  }).join('');
}

function openExhibitorModal(exhId) {
  const hiddenId = document.getElementById('exhibitor-modal-id-hidden');
  const title = document.getElementById('exhibitor-modal-title');
  const inCompany = document.getElementById('exh-company-input');
  const inGstin = document.getElementById('exh-gstin-input');
  const inContact = document.getElementById('exh-contact-input');
  const inPhone = document.getElementById('exh-phone-input');
  const inEmail = document.getElementById('exh-email-input');
  const inWeb = document.getElementById('exh-web-input');
  const inCategory = document.getElementById('exh-category-input');
  const inStall = document.getElementById('exh-stall-input');
  const inAddress = document.getElementById('exh-address-input');

  let currentStall = '';
  if (exhId) {
    const ex = db.exhibitors.find(x => x.id === exhId);
    if (ex) currentStall = ex.assigned_stall;
  }
  
  let stallOptions = `<option value="">-- Assign Stall --</option>`;
  db.stalls.forEach(s => {
    if (s.status === 'available' || s.id === currentStall) {
      stallOptions += `<option value="${s.id}" ${s.id === currentStall ? 'selected' : ''}>Stall ${s.id} (${s.block} - ${s.category})</option>`;
    }
  });
  inStall.innerHTML = stallOptions;

  document.getElementById('exhibitor-modal-form').reset();
  hiddenId.value = '';

  if (exhId) {
    const ex = db.exhibitors.find(x => x.id === exhId);
    if (ex) {
      title.textContent = 'Edit Exhibitor Profile';
      hiddenId.value = ex.id;
      inCompany.value = ex.company;
      inGstin.value = ex.gstin || '';
      inContact.value = ex.contact_person;
      inPhone.value = ex.phone;
      inEmail.value = ex.email;
      inWeb.value = ex.website || '';
      inCategory.value = ex.category;
      inStall.value = ex.assigned_stall;
      inAddress.value = ex.address || '';
      renderExhModalFiles(ex.documents || []);
    }
  } else {
    title.textContent = 'Add Confirmed Exhibitor';
    renderExhModalFiles([]);
  }

  openModal('modal-exhibitor');
}

function renderExhModalFiles(docs) {
  const container = document.getElementById('modal-exh-files-list');
  if (!container) return;
  if (!docs || docs.length === 0) {
    container.innerHTML = `<em style="font-size:0.7rem; color:var(--text-muted);">No documents uploaded yet.</em>`;
    return;
  }
  container.innerHTML = docs.map((doc, idx) => `
    <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-section); padding:4px 8px; border-radius:4px; margin-top:4px; font-size:0.7rem;">
      <span>📄 ${doc.name} (${doc.size})</span>
      <button type="button" style="color:var(--status-sold); background:none; font-weight:700;" onclick="removeExhModalFile(${idx})">&times;</button>
    </div>
  `).join('');
}

function removeExhModalFile(idx) {
  const hiddenId = document.getElementById('exhibitor-modal-id-hidden').value;
  if (hiddenId) {
    const exIdx = db.exhibitors.findIndex(e => e.id === hiddenId);
    if (exIdx !== -1) {
      db.exhibitors[exIdx].documents.splice(idx, 1);
      commitLocalDatabase(DB_EXHIBITORS, db.exhibitors);
      renderExhModalFiles(db.exhibitors[exIdx].documents);
      renderExhibitorsTable();
      showToast('Document removed.');
    }
  }
}

function uploadExhibitorDocFromModal(input) {
  const file = input.files[0];
  if (!file) return;

  const hiddenId = document.getElementById('exhibitor-modal-id-hidden').value;
  if (!hiddenId) {
    alert('Please save the exhibitor first before uploading files.');
    return;
  }

  const idx = db.exhibitors.findIndex(e => e.id === hiddenId);
  if (idx !== -1) {
    if (!db.exhibitors[idx].documents) db.exhibitors[idx].documents = [];
    db.exhibitors[idx].documents.push({
      name: file.name,
      type: file.type || 'application/pdf',
      date: new Date().toISOString().split('T')[0],
      size: (file.size / 1024).toFixed(1) + ' KB'
    });
    commitLocalDatabase(DB_EXHIBITORS, db.exhibitors);
    renderExhModalFiles(db.exhibitors[idx].documents);
    renderExhibitorsTable();
    showToast(`📄 File ${file.name} uploaded.`);
  }
}

function submitExhibitorForm(e) {
  e.preventDefault();
  const hiddenId = document.getElementById('exhibitor-modal-id-hidden').value;
  const inCompany = document.getElementById('exh-company-input').value.trim();
  const inGstin = document.getElementById('exh-gstin-input').value.trim();
  const inContact = document.getElementById('exh-contact-input').value.trim();
  const inPhone = document.getElementById('exh-phone-input').value.trim();
  const inEmail = document.getElementById('exh-email-input').value.trim();
  const inWeb = document.getElementById('exh-web-input').value.trim();
  const inCategory = document.getElementById('exh-category-input').value;
  const inStall = document.getElementById('exh-stall-input').value;
  const inAddress = document.getElementById('exh-address-input').value.trim();

  if (!inCompany || !inGstin || !inContact || !inPhone || !inEmail || !inStall) {
    alert('Please fill out all required fields.');
    return;
  }

  let oldStall = '';
  if (hiddenId) {
    const idx = db.exhibitors.findIndex(e => e.id === hiddenId);
    if (idx !== -1) {
      oldStall = db.exhibitors[idx].assigned_stall;
      db.exhibitors[idx].company = inCompany;
      db.exhibitors[idx].gstin = inGstin;
      db.exhibitors[idx].contact_person = inContact;
      db.exhibitors[idx].phone = inPhone;
      db.exhibitors[idx].email = inEmail;
      db.exhibitors[idx].website = inWeb;
      db.exhibitors[idx].category = inCategory;
      db.exhibitors[idx].assigned_stall = inStall;
      db.exhibitors[idx].address = inAddress;
      logActivity(`Exhibitor profile for <strong>${inCompany}</strong> updated.`);
    }
  } else {
    const newEx = {
      id: 'ex-' + Date.now(),
      company: inCompany,
      gstin: inGstin,
      contact_person: inContact,
      phone: inPhone,
      email: inEmail,
      website: inWeb,
      category: inCategory,
      assigned_stall: inStall,
      address: inAddress,
      documents: [],
      status: 'active'
    };
    db.exhibitors.push(newEx);
    logActivity(`New Exhibitor profile <strong>${inCompany}</strong> added manually.`);
  }

  commitLocalDatabase(DB_EXHIBITORS, db.exhibitors);

  let stalls = JSON.parse(localStorage.getItem(DB_STALLS)) || [];
  if (oldStall && oldStall !== inStall) {
    const oldIdx = stalls.findIndex(s => s.id === oldStall);
    if (oldIdx !== -1) {
      stalls[oldIdx].status = 'available';
      stalls[oldIdx].assigned_company = null;
    }
  }
  const newIdx = stalls.findIndex(s => s.id === inStall);
  if (newIdx !== -1) {
    stalls[newIdx].status = 'sold';
    stalls[newIdx].assigned_company = inCompany;
  }
  localStorage.setItem(DB_STALLS, JSON.stringify(stalls));

  let payments = JSON.parse(localStorage.getItem(DB_PAYMENTS)) || [];
  let pay = payments.find(p => p.company === inCompany && p.stall_number === inStall);
  if (!pay) {
    const newIdx = stalls.findIndex(s => s.id === inStall);
    if (newIdx !== -1) {
      let base = stalls[newIdx].price;
      let gst = Math.round(base * 0.18);
      payments.push({
        id: 'p-' + Date.now(),
        company: inCompany,
        stall_number: inStall,
        amount: base,
        gst: gst,
        total: base + gst,
        paid: base + gst,
        pending: 0,
        due_date: new Date().toISOString().split('T')[0],
        status: 'paid',
        history: [{
          date: new Date().toISOString().split('T')[0],
          amount: base + gst,
          method: 'Admin Manual',
          ref: 'TXN-' + Math.floor(100000 + Math.random()*900000)
        }]
      });
      localStorage.setItem(DB_PAYMENTS, JSON.stringify(payments));
    }
  }

  closeModal('modal-exhibitor');
  syncRamData();
  renderExhibitorsTable();
  renderStallsTable();
  renderAdminMapSVG();
  renderPaymentsTable();
  showToast('💾 Exhibitor profiles synchronized.');
}

function deleteExhibitor(exhId) {
  if (confirm('Are you sure you want to delete this exhibitor profile? This will release their stall!')) {
    const idx = db.exhibitors.findIndex(e => e.id === exhId);
    if (idx !== -1) {
      const company = db.exhibitors[idx].company;
      const stallId = db.exhibitors[idx].assigned_stall;
      db.exhibitors.splice(idx, 1);
      commitLocalDatabase(DB_EXHIBITORS, db.exhibitors);

      let stalls = JSON.parse(localStorage.getItem(DB_STALLS)) || [];
      const stallIdx = stalls.findIndex(s => s.id === stallId);
      if (stallIdx !== -1) {
        stalls[stallIdx].status = 'available';
        stalls[stallIdx].assigned_company = null;
        localStorage.setItem(DB_STALLS, JSON.stringify(stalls));
      }

      logActivity(`Exhibitor <strong>${company}</strong> removed.`);
      syncRamData();
      renderExhibitorsTable();
      renderStallsTable();
      renderAdminMapSVG();
      showToast('🗑️ Exhibitor profile removed.');
    }
  }
}

// ── Payments and Ledger controllers ──
function renderPaymentsTable() {
  const statusF = document.getElementById('pay-filter-status') ? document.getElementById('pay-filter-status').value : '';
  const searchF = document.getElementById('pay-search-company') ? document.getElementById('pay-search-company').value.toLowerCase().trim() : '';

  let filtered = db.payments.filter(p => {
    if (statusF && p.status !== statusF) return false;
    if (searchF) {
      const comp = p.company.toLowerCase();
      const stall = p.stall_number.toLowerCase();
      if (!comp.includes(searchF) && !stall.includes(searchF)) return false;
    }
    return true;
  });

  let totalInvoiced = 0;
  let totalCollected = 0;
  let totalPending = 0;
  db.payments.forEach(p => {
    totalInvoiced += p.total;
    totalCollected += p.paid;
    totalPending += p.pending;
  });

  if (document.getElementById('ledger-kpi-total')) document.getElementById('ledger-kpi-total').textContent = '₹' + totalInvoiced.toLocaleString('en-IN');
  if (document.getElementById('ledger-kpi-collected')) document.getElementById('ledger-kpi-collected').textContent = '₹' + totalCollected.toLocaleString('en-IN');
  if (document.getElementById('ledger-kpi-pending')) document.getElementById('ledger-kpi-pending').textContent = '₹' + totalPending.toLocaleString('en-IN');

  const tbody = document.getElementById('payments-table-body');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:2rem; color:var(--text-muted);">No payment ledgers found matching criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    let actionsHtml = `
      <div style="display:flex; gap:4px; justify-content:center;">
    `;
    if (p.pending > 0 && (activeRole === 'super_admin' || activeRole === 'admin' || activeRole === 'finance_manager')) {
      actionsHtml += `<button class="btn-action-primary" style="font-size:10px; padding:2px 6px;" onclick="openPaymentModal('${p.id}')">💳 Record Pay</button>`;
    }
    actionsHtml += `<button class="btn-action-outline" style="font-size:10px; padding:2px 6px;" onclick="printInvoice('${p.id}')">🖨️ Invoice</button>`;
    actionsHtml += `</div>`;

    return `
      <tr>
        <td><strong>${p.company}</strong></td>
        <td><span style="color:var(--copper); font-weight:700;">Stall ${p.stall_number}</span></td>
        <td>₹${p.amount.toLocaleString('en-IN')}</td>
        <td>₹${p.gst.toLocaleString('en-IN')}</td>
        <td style="font-weight:700;">₹${p.total.toLocaleString('en-IN')}</td>
        <td style="color:var(--status-available); font-weight:700;">₹${p.paid.toLocaleString('en-IN')}</td>
        <td style="color:var(--status-sold); font-weight:700;">₹${p.pending.toLocaleString('en-IN')}</td>
        <td>${p.due_date}</td>
        <td><span class="status-badge ${p.status}">${p.status.toUpperCase()}</span></td>
        <td>${actionsHtml}</td>
      </tr>
    `;
  }).join('');
}

function openPaymentModal(payId) {
  const hiddenId = document.getElementById('payment-id-hidden');
  const inCompany = document.getElementById('payment-company-display');
  const inStall = document.getElementById('payment-stall-display');
  const inTotal = document.getElementById('payment-total-display');
  const inPaid = document.getElementById('payment-paid-display');
  const inPending = document.getElementById('payment-pending-display');
  const inAmount = document.getElementById('payment-amount-input');
  const inMethod = document.getElementById('payment-method-input');
  const inRef = document.getElementById('payment-ref-input');

  const p = db.payments.find(x => x.id === payId);
  if (!p) return;

  hiddenId.value = p.id;
  inCompany.value = p.company;
  inStall.value = p.stall_number;
  inTotal.value = '₹' + p.total.toLocaleString('en-IN');
  inPaid.value = '₹' + p.paid.toLocaleString('en-IN');
  inPending.value = '₹' + p.pending.toLocaleString('en-IN');
  
  inAmount.value = p.pending;
  inMethod.value = 'NEFT / RTGS';
  inRef.value = '';

  openModal('modal-payment');
}

function submitPaymentTransaction(e) {
  e.preventDefault();
  const hiddenId = document.getElementById('payment-id-hidden').value;
  const payAmount = parseFloat(document.getElementById('payment-amount-input').value);
  const payMethod = document.getElementById('payment-method-input').value;
  const payRef = document.getElementById('payment-ref-input').value.trim();

  if (isNaN(payAmount) || payAmount <= 0) {
    alert('Please enter a valid payment amount.');
    return;
  }
  if (!payRef) {
    alert('Please enter a transaction reference number.');
    return;
  }

  const idx = db.payments.findIndex(p => p.id === hiddenId);
  if (idx !== -1) {
    const p = db.payments[idx];
    if (payAmount > p.pending) {
      alert(`Payment amount (₹${payAmount}) cannot exceed pending amount (₹${p.pending}).`);
      return;
    }

    p.paid += payAmount;
    p.pending = p.total - p.paid;
    if (p.pending === 0) p.status = 'paid';
    else p.status = 'partial';

    if (!p.history) p.history = [];
    p.history.push({
      date: new Date().toISOString().split('T')[0],
      amount: payAmount,
      method: payMethod,
      ref: payRef
    });

    logActivity(`Recorded payment of ₹${payAmount} for <strong>${p.company}</strong>. Ref: ${payRef}`);
    addCrmTimelineEntry(p.company, 'payment', `Recorded payment of ₹${payAmount} via ${payMethod}. Transaction Ref: ${payRef}. Remaining pending: ₹${p.pending}.`);
    
    commitLocalDatabase(DB_PAYMENTS, db.payments);
    closeModal('modal-payment');
    renderPaymentsTable();
    showToast('💳 Payment registered successfully.');
  }
}

function printInvoice(payId) {
  const p = db.payments.find(x => x.id === payId);
  if (!p) return;

  const invoiceWindow = window.open('', '_blank');
  invoiceWindow.document.write(`
    <html>
      <head>
        <title>GST Invoice - ${p.company}</title>
        <style>
          body { font-family: 'Outfit', sans-serif; padding: 40px; color: #000000; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #F24405; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: 800; color: #F24405; }
          .details { margin: 30px 0; display: flex; justify-content: space-between; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          th, td { border: 1px solid rgba(0,0,0,0.1); padding: 12px; text-align: left; }
          th { background: #F2F0E4; }
          .totals { text-align: right; margin-top: 30px; font-size: 16px; line-height: 1.8; }
          .stamp { margin-top: 50px; text-align: right; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">⚡ DHAN ENTERPRISE</div>
            <div>Encompassing Energy Revolution</div>
            <div>Peoples Plaza, NTR Marg, Hyderabad</div>
          </div>
          <div style="text-align: right;">
            <h2>TAX INVOICE</h2>
            <div>Invoice No: IRE2026-${p.id.split('-')[1] || 'INV'}</div>
            <div>Date: ${p.due_date}</div>
          </div>
        </div>
        <div class="details">
          <div>
            <strong>BILLED TO:</strong><br>
            ${p.company}<br>
            GSTIN: ${db.exhibitors.find(e => e.company === p.company)?.gstin || 'Not Provided'}<br>
            Hyderabad Exhibition Delegate
          </div>
          <div>
            <strong>EVENT DETAILS:</strong><br>
            India Renewable Energy Expo 2026<br>
            Venue: HMDA Grounds, Peoples Plaza, Hyderabad<br>
            Dates: 3rd & 4th July 2026
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Stall Code</th>
              <th>Base Rate</th>
              <th>CGST (9%)</th>
              <th>SGST (9%)</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Exhibition Booth Space Booking Fee</td>
              <td><strong>Stall ${p.stall_number}</strong></td>
              <td>₹${p.amount.toLocaleString('en-IN')}</td>
              <td>₹${Math.round(p.gst / 2).toLocaleString('en-IN')}</td>
              <td>₹${Math.round(p.gst / 2).toLocaleString('en-IN')}</td>
              <td><strong>₹${p.total.toLocaleString('en-IN')}</strong></td>
            </tr>
          </tbody>
        </table>
        <div class="totals">
          <div>Subtotal: ₹${p.amount.toLocaleString('en-IN')}</div>
          <div>GST (18%): ₹${p.gst.toLocaleString('en-IN')}</div>
          <div style="font-size: 20px; font-weight: 800; color: #F24405;">Total Amount Paid: ₹${p.paid.toLocaleString('en-IN')}</div>
          <div style="font-size: 16px; font-weight: 700; color: #c62828;">Outstanding Balance: ₹${p.pending.toLocaleString('en-IN')}</div>
        </div>
        <div class="stamp">
          Certified Digital Allotment Invoice<br>
          Co-organised by Dhan Enterprise & Suprabha Trust
        </div>
        <script>window.print();</script>
      </body>
    </html>
  `);
  invoiceWindow.document.close();
}

// ── CRM Timeline features ──
function addCrmTimelineEntry(company, type, details) {
  let timeline = JSON.parse(localStorage.getItem('ire_db_crm_timeline')) || [];
  timeline.push({
    id: 'crm-' + Date.now() + '-' + Math.floor(Math.random()*100),
    company_id: company,
    type: type,
    details: details,
    timestamp: new Date().toISOString(),
    created_by: activeRole.replace('_', ' ').toUpperCase()
  });
  localStorage.setItem('ire_db_crm_timeline', JSON.stringify(timeline));
}

function viewCrmTimeline(companyName) {
  document.getElementById('crm-timeline-company').textContent = companyName;
  const listEl = document.getElementById('crm-timeline-list');
  if (!listEl) return;

  const timeline = JSON.parse(localStorage.getItem('ire_db_crm_timeline')) || [];
  const companyLogs = timeline.filter(t => t.company_id.toLowerCase() === companyName.toLowerCase());

  if (companyLogs.length === 0) {
    listEl.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted); font-size:0.75rem;">No historical communications recorded for this company.</div>`;
  } else {
    companyLogs.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    listEl.innerHTML = companyLogs.map(log => {
      let icon = '💬';
      if (log.type === 'call') icon = '📞';
      else if (log.type === 'email') icon = '✉️';
      else if (log.type === 'whatsapp') icon = '🟢';
      else if (log.type === 'meeting') icon = '📅';
      else if (log.type === 'payment') icon = '💳';

      const dateStr = new Date(log.timestamp).toLocaleString();
      return `
        <div style="background:var(--bg-section); border-left: 3px solid var(--copper); padding: 8px 12px; border-radius: 4px; font-size:0.74rem;">
          <div style="display:flex; justify-content:space-between; font-weight:700; margin-bottom:4px; color:var(--text);">
            <span>${icon} ${log.type.toUpperCase()} - by ${log.created_by}</span>
            <span style="font-weight:500; color:var(--text-muted); font-size:10px;">${dateStr}</span>
          </div>
          <div style="color:var(--text-dim);">${log.details}</div>
        </div>
      `;
    }).join('');
  }

  openModal('modal-crm-timeline');
}

// ── Sponsor Applications Reviewer ──
function renderSponsorAppsTable() {
  const tbody = document.getElementById('sponsor-apps-table-body');
  if (!tbody) return;

  const sponsors = db.sponsor_applications || [];
  
  if (sponsors.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--text-muted);">No sponsorship applications submitted.</td></tr>`;
    return;
  }

  tbody.innerHTML = sponsors.map(s => {
    let actionsHtml = '';
    if (s.status === 'submitted' || s.status === 'under_review' || s.status === 'negotiation') {
      actionsHtml = `
        <div style="display:flex; gap:4px; justify-content:center;">
          <button class="btn-action-primary" style="font-size:10px; padding:2px 6px; background:var(--status-available);" onclick="changeSponsorStatus('${s.id}', 'confirmed')">✅ Approve</button>
          <button class="btn-action-outline" style="font-size:10px; padding:2px 6px; color:var(--status-sold);" onclick="changeSponsorStatus('${s.id}', 'rejected')">❌ Reject</button>
        </div>
      `;
    } else {
      actionsHtml = `<em style="font-size:0.7rem; color:var(--text-muted);">${s.status.toUpperCase()}</em>`;
    }

    return `
      <tr>
        <td><strong>${s.company}</strong></td>
        <td>👤 ${s.contact_person || '—'}</td>
        <td><span style="font-size:10px;">📞 ${s.phone || '—'}<br>✉️ ${s.email || '—'}</span></td>
        <td>${s.industry || 'Renewable Energy'}</td>
        <td><span class="category-badge" style="background:#fff3e0; color:#f57c00;">${s.package || s.type}</span></td>
        <td><span style="font-size:10px;">₹${(s.amount || (s.package === 'Title' ? 1500000 : s.package === 'Platinum' ? 800000 : s.package === 'Gold' ? 500000 : s.package === 'Silver' ? 300000 : 200000)).toLocaleString()}</span></td>
        <td><span class="status-badge ${s.status === 'confirmed' || s.status === 'paid' ? 'available' : s.status}">${s.status.toUpperCase()}</span></td>
        <td>${actionsHtml}</td>
      </tr>
    `;
  }).join('');
}

async function changeSponsorStatus(sId, newStatus) {
  try {
    const res = await fetch(`/api/sponsor_applications/${sId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) throw new Error('Failed to update sponsor application status');

    const appItem = db.sponsor_applications.find(a => a.id === sId);
    const companyName = appItem ? appItem.company : 'Sponsor';

    logActivity(`Sponsorship package for <strong>${companyName}</strong> updated to ${newStatus}.`);
    await syncRamData();
    renderSponsorAppsTable();
    showToast(`Sponsor status updated to ${newStatus}.`);
  } catch (err) {
    console.error(err);
    showToast('⚠️ Sync failed: ' + err.message);
  }
}

// ── Organiser Task Manager ──
function renderTasksTable() {
  const statusF = document.getElementById('task-filter-status') ? document.getElementById('task-filter-status').value : '';
  const catF = document.getElementById('task-filter-category') ? document.getElementById('task-filter-category').value : '';

  let tasks = JSON.parse(localStorage.getItem('ire_db_tasks')) || [];

  let filtered = tasks.filter(t => {
    if (statusF && t.status !== statusF) return false;
    if (catF && t.category !== catF) return false;
    return true;
  });

  const tbody = document.getElementById('tasks-table-body');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">No tasks found matching criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(t => {
    let actionsHtml = `
      <div style="display:flex; gap:4px; justify-content:center;">
        <button class="btn-action-outline" style="font-size:10px; padding:2px 6px;" onclick="toggleTaskStatus('${t.id}')">🔄 Toggle Status</button>
        <button class="btn-action-outline" style="font-size:10px; padding:2px 6px; color:var(--status-sold);" onclick="deleteTask('${t.id}')">🗑️ Delete</button>
      </div>
    `;

    let statusClass = t.status === 'Completed' ? 'available' : t.status === 'In Progress' ? 'pending' : 'reserved';

    return `
      <tr>
        <td><strong>${t.title}</strong></td>
        <td><span class="status-badge ${t.priority === 'High' ? 'sold' : t.priority === 'Medium' ? 'pending' : 'available'}">${t.priority}</span></td>
        <td>📅 ${t.deadline}</td>
        <td>👤 ${t.assigned_user}</td>
        <td><span class="category-badge">${t.category}</span></td>
        <td><span class="status-badge ${statusClass}">${t.status}</span></td>
        <td>${actionsHtml}</td>
      </tr>
    `;
  }).join('');
}

function openAddTaskModal() {
  document.getElementById('task-modal-form').reset();
  document.getElementById('task-modal-title').textContent = 'Create Organiser Task';
  openModal('modal-task');
}

function submitTaskForm(e) {
  e.preventDefault();
  const title = document.getElementById('task-title-input').value.trim();
  const priority = document.getElementById('task-priority-input').value;
  const deadline = document.getElementById('task-deadline-input').value;
  const assigned = document.getElementById('task-user-input').value;
  const category = document.getElementById('task-category-input').value;

  if (!title || !deadline) {
    alert('Please fill in all required fields.');
    return;
  }

  let tasks = JSON.parse(localStorage.getItem('ire_db_tasks')) || [];
  tasks.push({
    id: 'task-' + Date.now(),
    title: title,
    priority: priority,
    deadline: deadline,
    assigned_user: assigned,
    category: category,
    status: 'Pending'
  });
  localStorage.setItem('ire_db_tasks', JSON.stringify(tasks));

  logActivity(`New task created: "${title}" assigned to ${assigned}.`);
  closeModal('modal-task');
  renderTasksTable();
  showToast('🛠️ Task created successfully.');
}

function toggleTaskStatus(taskId) {
  let tasks = JSON.parse(localStorage.getItem('ire_db_tasks')) || [];
  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx !== -1) {
    const oldStatus = tasks[idx].status;
    if (oldStatus === 'Pending') tasks[idx].status = 'In Progress';
    else if (oldStatus === 'In Progress') tasks[idx].status = 'Completed';
    else tasks[idx].status = 'Pending';

    logActivity(tasks[idx].title ? `Task "${tasks[idx].title}" status toggled from ${oldStatus} to ${tasks[idx].status}.` : '');
    localStorage.setItem('ire_db_tasks', JSON.stringify(tasks));
    renderTasksTable();
    showToast(`Task status updated to ${tasks[idx].status}.`);
  }
}

function deleteTask(taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
    let tasks = JSON.parse(localStorage.getItem('ire_db_tasks')) || [];
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      logActivity(`Deleted task "${tasks[idx].title}".`);
      tasks.splice(idx, 1);
      localStorage.setItem('ire_db_tasks', JSON.stringify(tasks));
      renderTasksTable();
      showToast('🗑️ Task deleted.');
    }
  }
}

// ── Exhibitor Portal view controllers ──
function getActiveExhibitor() {
  const exhibitors = JSON.parse(localStorage.getItem(DB_EXHIBITORS)) || [];
  if (exhibitors.length > 0) {
    if (!activeExhibitorCompany) {
      activeExhibitorCompany = exhibitors[0].company;
    }
    return exhibitors.find(e => e.company.toLowerCase() === activeExhibitorCompany.toLowerCase()) || exhibitors[0];
  }
  return null;
}

function switchPortalExhibitor(companyName) {
  activeExhibitorCompany = companyName;
  renderExhibitorPortal();
  showToast(`Switched portal view to ${companyName}`);
}

function renderExhibitorPortal() {
  const switcher = document.getElementById('ex-portal-company-switcher');
  if (switcher) {
    const exhibitors = JSON.parse(localStorage.getItem(DB_EXHIBITORS)) || [];
    switcher.innerHTML = exhibitors.map(e => `<option value="${e.company}" ${e.company === activeExhibitorCompany ? 'selected' : ''}>${e.company}</option>`).join('');
  }

  const ex = getActiveExhibitor();
  if (!ex) {
    document.getElementById('ex-portal-company').textContent = 'No Exhibitor Registered';
    document.getElementById('ex-portal-stall').textContent = 'None';
    document.getElementById('ex-portal-gstin').textContent = '—';
    return;
  }

  activeExhibitorCompany = ex.company;

  document.getElementById('ex-portal-company').textContent = ex.company;
  document.getElementById('ex-portal-stall').textContent = 'Stall ' + ex.assigned_stall;
  document.getElementById('ex-portal-gstin').textContent = ex.gstin || 'Not Provided';

  const docsList = document.getElementById('ex-portal-docs-list');
  if (docsList) {
    if (!ex.documents || ex.documents.length === 0) {
      docsList.innerHTML = `<li><em style="color:var(--text-muted);">No brochures or profiles uploaded yet.</em></li>`;
    } else {
      docsList.innerHTML = ex.documents.map(d => `
        <li style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-section); padding:6px 10px; border-radius:4px; margin-top:5px;">
          <span>📄 ${d.name} (${d.size}) - Uploaded ${d.date}</span>
        </li>
      `).join('');
    }
  }

  const payments = JSON.parse(localStorage.getItem(DB_PAYMENTS)) || [];
  const pay = payments.find(p => p.company.toLowerCase() === ex.company.toLowerCase() && p.stall_number === ex.assigned_stall);

  const statusBadge = document.getElementById('ex-portal-payment-status');
  const dueEl = document.getElementById('ex-portal-payment-due');
  const certBtn = document.getElementById('ex-portal-cert-btn');

  if (pay) {
    statusBadge.className = 'status-badge ' + pay.status;
    statusBadge.textContent = pay.status.toUpperCase();
    dueEl.textContent = '₹' + pay.pending.toLocaleString('en-IN');
    
    if (pay.status === 'paid' || pay.pending === 0) {
      certBtn.disabled = false;
    } else {
      certBtn.disabled = true;
    }
  } else {
    statusBadge.className = 'status-badge pending';
    statusBadge.textContent = 'UNINVOICED';
    dueEl.textContent = '₹0';
    certBtn.disabled = true;
  }

  const meetingsBody = document.getElementById('ex-portal-meetings-tbody');
  if (meetingsBody) {
    const meetings = JSON.parse(localStorage.getItem('ire_db_meetings')) || [];
    const myMeetings = meetings.filter(m => m.exhibitor_name.toLowerCase() === ex.company.toLowerCase());

    if (myMeetings.length === 0) {
      meetingsBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:var(--text-muted);">No delegate meeting requests scheduled.</td></tr>`;
    } else {
      meetingsBody.innerHTML = myMeetings.map(m => {
        let actionBtn = '';
        if (m.status === 'pending') {
          actionBtn = `
            <div style="display:flex; gap:2px;">
              <button class="btn-action-primary" style="font-size:9px; padding:2px 4px; background:var(--status-available);" onclick="respondToMeeting('${m.id}', 'accepted')">Accept</button>
              <button class="btn-action-outline" style="font-size:9px; padding:2px 4px; color:var(--status-sold);" onclick="respondToMeeting('${m.id}', 'rejected')">Decline</button>
            </div>
          `;
        } else {
          actionBtn = `<span class="status-badge ${m.status === 'accepted' ? 'available' : 'sold'}">${m.status.toUpperCase()}</span>`;
        }

        return `
          <tr>
            <td><strong>${m.visitor_name}</strong><br><span style="font-size:9px; color:var(--text-muted);">${m.visitor_email}</span></td>
            <td>📅 ${m.date}<br>🕒 ${m.time}</td>
            <td><span style="font-size:10px;">${m.notes || '—'}</span></td>
            <td><span class="status-badge ${m.status}">${m.status}</span></td>
            <td>${actionBtn}</td>
          </tr>
        `;
      }).join('');
    }
  }
}

function respondToMeeting(mId, status) {
  let meetings = JSON.parse(localStorage.getItem('ire_db_meetings')) || [];
  const idx = meetings.findIndex(m => m.id === mId);
  if (idx !== -1) {
    meetings[idx].status = status;
    localStorage.setItem('ire_db_meetings', JSON.stringify(meetings));
    logActivity(`B2B Meeting request with ${meetings[idx].visitor_name} updated to ${status}.`);
    renderExhibitorPortal();
    showToast(`Meeting request ${status}.`);
  }
}

function uploadExhibitorDocFromPortal(e) {
  e.preventDefault();
  const fileInput = document.getElementById('ex-portal-brochure-file');
  const file = fileInput.files[0];
  if (!file) return;

  const ex = getActiveExhibitor();
  if (!ex) return;

  let exhibitors = JSON.parse(localStorage.getItem(DB_EXHIBITORS)) || [];
  const idx = exhibitors.findIndex(e => e.id === ex.id);
  if (idx !== -1) {
    if (!exhibitors[idx].documents) exhibitors[idx].documents = [];
    exhibitors[idx].documents.push({
      name: file.name,
      type: file.type || 'application/pdf',
      date: new Date().toISOString().split('T')[0],
      size: (file.size / 1024).toFixed(1) + ' KB'
    });
    localStorage.setItem(DB_EXHIBITORS, JSON.stringify(exhibitors));
    fileInput.value = '';
    syncRamData();
    renderExhibitorPortal();
    showToast(`📄 Brochure ${file.name} uploaded successfully.`);
  }
}

function downloadExhibitorInvoice() {
  const ex = getActiveExhibitor();
  if (!ex) return;
  const payments = JSON.parse(localStorage.getItem(DB_PAYMENTS)) || [];
  const pay = payments.find(p => p.company.toLowerCase() === ex.company.toLowerCase() && p.stall_number === ex.assigned_stall);
  if (pay) {
    printInvoice(pay.id);
  } else {
    alert('Invoice not found for this exhibitor profile.');
  }
}

function downloadExhibitorCert() {
  const ex = getActiveExhibitor();
  if (!ex) return;
  
  const content = document.getElementById('certificate-print-area');
  if (content) {
    content.innerHTML = `
      <div style="font-size:1.5rem; letter-spacing:2px; font-weight:800; color:var(--copper); margin-bottom:1.5rem;">CERTIFICATE OF PARTICIPATION</div>
      <p style="font-size:1rem; margin-bottom:1.5rem;">This is proudly presented to</p>
      <div style="font-size:2.2rem; font-weight:900; font-family:var(--font-display); color:var(--text); margin-bottom:1.5rem; text-decoration:underline;">${ex.company}</div>
      <p style="font-size:1rem; line-height:1.8; margin-bottom:2rem; max-width:550px; margin-left:auto; margin-right:auto;">
        for their active participation and showcase of clean energy technologies as a confirmed B2B Exhibitor at the <strong>India Renewable Energy Expo 2026</strong>.
      </p>
      <div style="font-size:0.9rem; font-weight:bold; color:var(--text-muted); margin-bottom:3rem;">
        Held on 3rd & 4th July 2026 at HMDA Grounds, Peoples Plaza, Hyderabad.
      </div>
      <div style="display:flex; justify-content:space-between; border-top:1px dashed #ccc; padding-top:1.5rem; font-size:0.85rem;">
        <div>
          <strong>Suprabha Trust</strong><br>
          Co-organiser Representative
        </div>
        <div>
          <strong>Dhan Enterprise</strong><br>
          Co-organiser Representative
        </div>
      </div>
    `;
    openModal('modal-certificate');
  }
}

// Override applyRolePermissions for Phase 3 Granular gate rules
function applyRolePermissions() {
  const allNavs = [
    { id: 'nav-btn-dashboard',      roles: ['super_admin', 'event_director', 'finance_manager', 'sales_manager', 'sales_executive', 'sponsor_manager'] },
    { id: 'nav-btn-stalls',         roles: ['super_admin', 'event_director', 'sales_manager', 'sales_executive', 'finance_manager'] },
    { id: 'nav-btn-map',            roles: ['super_admin', 'event_director', 'sales_manager', 'sales_executive', 'finance_manager'] },
    { id: 'nav-btn-leads',          roles: ['super_admin', 'event_director', 'sales_manager', 'sales_executive'] },
    { id: 'nav-btn-exhibitors',     roles: ['super_admin', 'event_director', 'sales_manager', 'sales_executive'] },
    { id: 'nav-btn-payments',       roles: ['super_admin', 'event_director', 'finance_manager'] },
    { id: 'nav-btn-visitors',       roles: ['super_admin', 'event_director', 'sales_manager', 'sales_executive'] },
    { id: 'nav-btn-sponsors',       roles: ['super_admin', 'event_director', 'sponsor_manager'] },
    { id: 'nav-btn-sponsor-apps',   roles: ['super_admin', 'event_director', 'sponsor_manager'] },
    { id: 'nav-btn-program',        roles: ['super_admin', 'event_director'] },
    { id: 'nav-btn-marketing',      roles: ['super_admin', 'event_director', 'sales_manager'] },
    { id: 'nav-btn-media',          roles: ['super_admin', 'event_director', 'sponsor_manager'] },
    { id: 'nav-btn-tasks',          roles: ['super_admin', 'event_director', 'sales_manager', 'sales_executive', 'sponsor_manager', 'finance_manager'] },
    { id: 'nav-btn-reports',        roles: ['super_admin', 'event_director', 'finance_manager', 'sales_manager'] },
    { id: 'nav-btn-settings',       roles: ['super_admin'] },
    { id: 'nav-btn-exhibitor-portal', roles: ['exhibitor'] }
  ];

  allNavs.forEach(nav => {
    const el = document.getElementById(nav.id);
    if (el) {
      if (nav.roles.includes(activeRole)) {
        el.style.display = 'flex';
      } else {
        el.style.display = 'none';
      }
    }
  });

  // Switch view if current active view is not allowed for the role
  const currentNav = allNavs.find(n => n.id === 'nav-btn-' + currentActiveView);
  if (currentNav && !currentNav.roles.includes(activeRole)) {
    if (activeRole === 'exhibitor') {
      switchView('exhibitor-portal', document.getElementById('nav-btn-exhibitor-portal'));
    } else {
      switchView('dashboard', document.getElementById('nav-btn-dashboard'));
    }
  }

  // Refresh active views
  if (currentActiveView === 'stalls') renderStallsTable();
  if (currentActiveView === 'leads') renderLeadsTable();
  if (currentActiveView === 'exhibitors') renderExhibitorsTable();
  if (currentActiveView === 'payments') renderPaymentsTable();
  if (currentActiveView === 'sponsor-apps') renderSponsorAppsTable();
  if (currentActiveView === 'tasks') renderTasksTable();
  if (currentActiveView === 'exhibitor-portal') renderExhibitorPortal();
}

function printCertificateElement() {
  const printWindow = window.open('', '_blank');
  const style = `
    body { font-family: Georgia, serif; text-align: center; padding: 50px; color: #000000; border: 15px double #F24405; }
    h1 { font-size: 32px; color: #F24405; letter-spacing: 2px; }
  `;
  printWindow.document.write(`
    <html>
      <head>
        <title>Participation Certificate</title>
        <style>${style}</style>
      </head>
      <body>
        ${document.getElementById('certificate-print-area').innerHTML}
        <script>window.print();</script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

