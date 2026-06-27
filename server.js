const express = require('express');
const session = require('express-session');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./database');
const Razorpay = require('razorpay');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'ire-expo-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    secure: false // Set to true in HTTPS production
  }
}));

// Serves the public directories statically
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// Multer Storage Configuration for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'doc-' + Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'application/pdf'];
  
  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and image files (PNG, JPG, JPEG, GIF) are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper: Authenticate role checks
function checkAuth(roles = []) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized. Please login.' });
    }
    if (roles.length > 0 && !roles.includes(req.session.user.role)) {
      return res.status(403).json({ error: 'Access Denied: Insufficient permissions.' });
    }
    next();
  };
}

// ──────────────── AUTHENTICATION ROUTING ────────────────

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  db.get(`SELECT * FROM users WHERE username = ?`, [username.toLowerCase()], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid username or password.' });

    const passwordCorrect = bcrypt.compareSync(password, user.password_hash);
    if (!passwordCorrect) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role
    };
    res.json({ success: true, user: req.session.user });
  });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Could not log out.' });
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

app.get('/api/auth/session', (req, res) => {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.status(401).json({ success: false, error: 'Not authenticated' });
  }
});


// ──────────────── STALLS API ROUTING ────────────────

app.get('/api/stalls', (req, res) => {
  db.all(`SELECT * FROM stalls`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/api/stalls/:id', checkAuth(['super_admin', 'sales_manager', 'sales_executive']), (req, res) => {
  const { status, assigned_company } = req.body;
  const stallId = req.params.id;

  db.run(
    `UPDATE stalls SET status = ?, assigned_company = ? WHERE id = ?`,
    [status, assigned_company || null, stallId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, changes: this.changes });
    }
  );
});


// ──────────────── LEADS API ROUTING ────────────────

app.get('/api/leads', checkAuth(), (req, res) => {
  db.all(`SELECT * FROM leads`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/leads', checkAuth(['super_admin', 'sales_manager', 'sales_executive']), (req, res) => {
  const { company, segment, contact_person, phone, email, city, state, assigned_to, source, status, notes, lead_score } = req.body;
  const id = 'l-' + Date.now();

  db.run(
    `INSERT INTO leads VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, company, segment, contact_person, phone, email, city || '', state || '', assigned_to || 'Unassigned', source || 'Direct', status || 'new', notes || '', lead_score || 'Cold'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, leadId: id });
    }
  );
});

app.put('/api/leads/:id', checkAuth(['super_admin', 'sales_manager', 'sales_executive']), (req, res) => {
  const { company, segment, contact_person, phone, email, city, state, assigned_to, source, status, notes, lead_score } = req.body;
  const leadId = req.params.id;

  db.run(
    `UPDATE leads SET company = ?, segment = ?, contact_person = ?, phone = ?, email = ?, city = ?, state = ?, assigned_to = ?, source = ?, status = ?, notes = ?, lead_score = ? WHERE id = ?`,
    [company, segment, contact_person, phone, email, city, state, assigned_to, source, status, notes, lead_score, leadId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, changes: this.changes });
    }
  );
});

app.delete('/api/leads/:id', checkAuth(['super_admin', 'sales_manager']), (req, res) => {
  db.run(`DELETE FROM leads WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, changes: this.changes });
  });
});

// Convert Lead to Confirmed Exhibitor
app.post('/api/leads/:id/convert', checkAuth(['super_admin', 'sales_manager', 'sales_executive']), (req, res) => {
  const leadId = req.params.id;
  const { gstin, assigned_stall, payment_amount, category } = req.body;

  db.get(`SELECT * FROM leads WHERE id = ?`, [leadId], (err, lead) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!lead) return res.status(404).json({ error: 'Lead not found.' });

    // 1. Create Exhibitor record
    const exhibId = 'ex-' + Date.now();
    db.run(
      `INSERT INTO exhibitors (id, company, gstin, contact_person, phone, email, category, assigned_stall, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [exhibId, lead.company, gstin || '', lead.contact_person, lead.phone, lead.email, category || lead.segment, assigned_stall],
      (err1) => {
        if (err1) return res.status(500).json({ error: err1.message });

        // 2. Lock stall
        db.run(`UPDATE stalls SET status = 'sold', assigned_company = ? WHERE id = ?`, [lead.company, assigned_stall]);

        // 3. Create initial billing record
        const payId = 'p-' + Date.now();
        const amt = parseFloat(payment_amount || 100000);
        const gst = Math.round(amt * 0.18);
        const total = amt + gst;
        
        db.run(
          `INSERT INTO payments VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, 'pending', NULL, '[]')`,
          [payId, lead.company, assigned_stall, amt, gst, total, total, new Date().toISOString().split('T')[0]]
        );

        // 4. Update Lead status to converted
        db.run(`UPDATE leads SET status = 'confirmed', lead_score = 'Hot' WHERE id = ?`, [leadId]);

        // 5. Add to CRM Timeline
        const timelineId = 'crm-' + Date.now();
        db.run(
          `INSERT INTO crm_timeline VALUES (?, ?, 'payment', ?, ?, ?)`,
          [timelineId, lead.company, `Lead converted to Exhibitor. Assigned stall ${assigned_stall}. Billing ledger created.`, new Date().toISOString(), req.session.user.name]
        );

        res.json({ success: true, exhibitorId: exhibId });
      }
    );
  });
});


// ──────────────── EXHIBITORS API ROUTING ────────────────

app.get('/api/exhibitors', (req, res) => {
  db.all(`SELECT * FROM exhibitors`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/exhibitors', checkAuth(['super_admin', 'sales_manager']), (req, res) => {
  const { company, gstin, contact_person, phone, email, address, website, category, assigned_stall, status } = req.body;
  const id = 'ex-' + Date.now();

  db.run(
    `INSERT INTO exhibitors VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`,
    [id, company, gstin || '', contact_person, phone, email, address || '', website || '', category || '', assigned_stall || '', status || 'active'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, exhibitorId: id });
    }
  );
});

// Exhibitor Profile Uploads (brochure / logo)
app.post('/api/exhibitors/upload', checkAuth(['super_admin', 'admin', 'sales_executive']), upload.single('file'), (req, res) => {
  const { company_id, type } = req.body; // type: 'logo' or 'brochure'
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const filePath = '/uploads/' + req.file.filename;

  if (type === 'logo') {
    db.run(
      `UPDATE exhibitors SET logo_path = ? WHERE id = ? OR company = ?`,
      [filePath, company_id, company_id],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, logo_path: filePath });
      }
    );
  } else {
    // Save brochure to documents repository
    const docId = 'doc-' + Date.now();
    db.run(
      `INSERT INTO documents VALUES (?, ?, ?, ?, ?, ?)`,
      [docId, req.file.originalname, req.file.mimetype, new Date().toISOString().split('T')[0], (req.file.size / 1024).toFixed(1) + ' KB', company_id],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, docId, path: filePath });
      }
    );
  }
});


// ──────────────── PAYMENTS API ROUTING ────────────────

app.get('/api/payments', checkAuth(), (req, res) => {
  db.all(`SELECT * FROM payments`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Parse payment history json strings
    const parsed = rows.map(r => ({ ...r, history: JSON.parse(r.payment_history || '[]') }));
    res.json(parsed);
  });
});

app.post('/api/payments/verify', (req, res) => {
  const signature = req.headers['x-payment-signature'] || req.headers['x-razorpay-signature'];
  const expectedSecret = process.env.PAYMENT_GATEWAY_SECRET || 'fallback-secret-hash';
  if (!signature || signature !== expectedSecret) {
    return res.status(401).json({ error: 'Unauthorized: Invalid payment verification signature.' });
  }

  const { payId, payment_method, ref_no, amount_paid } = req.body;
  
  db.get(`SELECT * FROM payments WHERE id = ?`, [payId], (err, record) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!record) return res.status(404).json({ error: 'Payment ledger row not found.' });

    const paidVal = parseFloat(amount_paid);
    const newPaidTotal = (record.paid || 0) + paidVal;
    const newPending = record.total - newPaidTotal;
    const newStatus = newPending <= 0 ? 'paid' : 'partial';

    const history = JSON.parse(record.payment_history || '[]');
    history.push({
      date: new Date().toISOString().split('T')[0],
      amount: paidVal,
      method: payment_method,
      ref: ref_no
    });

    db.run(
      `UPDATE payments SET paid = ?, pending = ?, status = ?, payment_ref = ?, payment_history = ? WHERE id = ?`,
      [newPaidTotal, newPending, newStatus, ref_no, JSON.stringify(history), payId],
      function(err1) {
        if (err1) return res.status(500).json({ error: err1.message });
        
        // Add crm timeline log
        db.run(`INSERT INTO crm_timeline VALUES (?, ?, 'payment', ?, ?, ?)`, [
          'crm-' + Date.now(),
          record.company,
          `Received payment of ₹${paidVal} via ${payment_method}. Ref: ${ref_no}. Status updated to ${newStatus}.`,
          new Date().toISOString(),
          req.session.user ? req.session.user.name : 'Razorpay Gateway'
        ]);

        res.json({ success: true, status: newStatus });
      }
    );
  });
});


// ──────────────── VISITORS API ROUTING ────────────────

app.get('/api/visitors', checkAuth(), (req, res) => {
  db.all(`SELECT * FROM visitors`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/visitors/count', (req, res) => {
  db.get(`SELECT COUNT(*) as count FROM visitors`, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ count: row ? row.count : 0 });
  });
});

app.post('/api/visitors/register', (req, res) => {
  const { name, phone, email, company, designation, city, state, type } = req.body;
  const passId = `IRE-V-${Math.floor(1000 + Math.random() * 9000)}`;

  db.run(
    `INSERT INTO visitors VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'registered', ?)`,
    [passId, name, phone, email, company, designation, city, state, type, new Date().toISOString().split('T')[0]],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });

      // Write WhatsApp & Email automation logs
      const timeNow = new Date().toISOString();
      db.run(`INSERT INTO automation_logs VALUES (?, 'email', 'Visitor Registered', ?, ?, ?)`, [
        'auto-' + Date.now() + '-1',
        email,
        `Dear ${name},\n\nYour visitor registration for IRE Expo 2026 is confirmed. Pass ID: ${passId}.`,
        timeNow
      ]);
      db.run(`INSERT INTO automation_logs VALUES (?, 'whatsapp', 'Visitor Registered', ?, ?, ?)`, [
        'auto-' + Date.now() + '-2',
        phone,
        `Hi ${name}, visitor pass for IRE Expo 2026 is confirmed. Pass ID: ${passId}.`,
        timeNow
      ]);

      res.json({ success: true, passId });
    }
  );
});

app.put('/api/visitors/:id/checkin', checkAuth(), (req, res) => {
  db.run(`UPDATE visitors SET status = 'checked_in' WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});


// ──────────────── MEETINGS & B2B API ────────────────

app.get('/api/meetings', checkAuth(['super_admin', 'admin', 'sales_executive']), (req, res) => {
  db.all(`SELECT * FROM meetings`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/meetings', (req, res) => {
  const { visitor_name, visitor_email, exhibitor_id, exhibitor_name, date, time, notes } = req.body;
  const id = 'meet-' + Date.now();

  db.run(
    `INSERT INTO meetings VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [id, visitor_name, visitor_email, exhibitor_id, exhibitor_name, date, time, notes || ''],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, meetingId: id });
    }
  );
});

app.put('/api/meetings/:id', checkAuth(['super_admin', 'admin', 'sales_executive']), (req, res) => {
  const { status } = req.body;
  db.run(`UPDATE meetings SET status = ? WHERE id = ?`, [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});


// ──────────────── TASKS API ROUTING ────────────────

app.get('/api/tasks', checkAuth(), (req, res) => {
  db.all(`SELECT * FROM tasks`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/tasks', checkAuth(), (req, res) => {
  const { title, priority, deadline, assigned_user, category } = req.body;
  const id = 'task-' + Date.now();

  db.run(
    `INSERT INTO tasks VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
    [id, title, priority, deadline, assigned_user, category],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, taskId: id });
    }
  );
});

app.put('/api/tasks/:id/toggle', checkAuth(), (req, res) => {
  db.get(`SELECT status FROM tasks WHERE id = ?`, [req.params.id], (err, row) => {
    if (err || !row) return res.status(500).json({ error: 'Task not found.' });

    let newStatus = 'Pending';
    if (row.status === 'Pending') newStatus = 'In Progress';
    else if (row.status === 'In Progress') newStatus = 'Completed';

    db.run(`UPDATE tasks SET status = ? WHERE id = ?`, [newStatus, req.params.id], function(err1) {
      if (err1) return res.status(500).json({ error: err1.message });
      res.json({ success: true, status: newStatus });
    });
  });
});

app.delete('/api/tasks/:id', checkAuth(), (req, res) => {
  db.run(`DELETE FROM tasks WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});


// ──────────────── SECURE STATIC WEB APP BOOKINGS ROUTE ────────────────

app.post('/api/bookings/checkout', upload.single('brochure'), (req, res) => {
  const { company, gstin, contactName, contactPhone, contactEmail, sector, stalls, amount } = req.body;
  if (!company || !stalls || !contactName || !contactPhone || !contactEmail || !amount) {
    return res.status(400).json({ error: 'Missing required booking details.' });
  }

  const pId = `IRE-26-${Math.floor(1000 + Math.random() * 9000)}`;
  const selectedStallsList = stalls.split(',').map(s => s.trim());
  const firstStall = selectedStallsList[0];

  // 1. Verify if any of the stalls are already booked
  const placeholders = selectedStallsList.map(() => '?').join(',');
  db.all(
    `SELECT id, status FROM stalls WHERE id IN (${placeholders})`,
    selectedStallsList,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const alreadySold = rows.filter(r => r.status === 'sold');
      if (alreadySold.length > 0) {
        const soldIds = alreadySold.map(r => r.id).join(', ');
        return res.status(400).json({ error: `Stall(s) already booked/sold: ${soldIds}` });
      }

      // 2. Perform checkout transactions
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        let hasError = false;
        const errorHandler = (errQuery) => {
          if (errQuery) {
            hasError = true;
          }
        };

        // Save brochure details if uploaded
        if (req.file) {
          const docId = 'doc-' + Date.now();
          db.run(`INSERT INTO documents VALUES (?, ?, ?, ?, ?, ?)`, [
            docId,
            req.file.originalname,
            req.file.mimetype,
            new Date().toISOString().split('T')[0],
            (req.file.size / 1024).toFixed(1) + ' KB',
            company
          ], errorHandler);
        }

        // Lock stalls in stalls table
        selectedStallsList.forEach(sId => {
          db.run(`UPDATE stalls SET status = 'sold', assigned_company = ? WHERE id = ?`, [company, sId], errorHandler);
        });

        // Add confirmed lead profile
        const leadId = 'l-' + Date.now();
        db.run(`INSERT INTO leads VALUES (?, ?, ?, ?, ?, ?, 'Online Booking', 'Online Booking', 'Hari Prasad', 'Website Form', 'confirmed', ?, 'Hot')`, [
          leadId, company, sector, contactName, contactPhone, contactEmail, `Reserved Stall(s) ${stalls} online. Invoice generated.`
        ], errorHandler);

        // Add Exhibitor Profile
        selectedStallsList.forEach(sId => {
          const exhId = 'ex-' + Date.now() + '-' + Math.floor(Math.random()*1000);
          db.run(`INSERT INTO exhibitors VALUES (?, ?, ?, ?, ?, ?, 'Not Provided (Online Booking)', 'Not Provided', ?, ?, NULL, 'active')`, [
            exhId, company, gstin || '', contactName, contactPhone, contactEmail, sector, sId
          ], errorHandler);
        });

        // Add Payment Record
        const payId = 'p-' + Date.now();
        const amtVal = parseFloat(amount.replace(/[^0-9.]/g, ''));
        const gstVal = Math.round(amtVal * 0.18);
        const totalVal = amtVal + gstVal;

        db.run(`INSERT INTO payments VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, 'paid', ?, ?)`, [
          payId,
          company,
          firstStall,
          amtVal,
          gstVal,
          totalVal,
          totalVal,
          new Date().toISOString().split('T')[0],
          'PAY-' + Math.floor(10000000 + Math.random() * 90000000),
          JSON.stringify([{
            date: new Date().toISOString().split('T')[0],
            amount: totalVal,
            method: 'Razorpay API',
            ref: 'PAY-' + Math.floor(10000000 + Math.random() * 90000000)
          }])
        ], errorHandler);

        // Timeline logger
        db.run(`INSERT INTO crm_timeline VALUES (?, ?, 'payment', ?, ?, 'B2B Portal')`, [
          'crm-' + Date.now(),
          company,
          `Reserved Stall(s) ${stalls} online. Received payment of ₹${totalVal}.`,
          new Date().toISOString()
        ], errorHandler);

        // WhatsApp & Email automation logs
        const timeNow = new Date().toISOString();
        db.run(`INSERT INTO automation_logs VALUES (?, 'email', 'Stall Booking Confirmed', ?, ?, ?)`, [
          'auto-' + Date.now() + '-1',
          contactEmail,
          `Dear ${contactName},\n\nYour online booking for Stall(s) ${stalls} is confirmed. Total: ${totalVal}.`,
          timeNow
        ], errorHandler);
        db.run(`INSERT INTO automation_logs VALUES (?, 'whatsapp', 'Stall Booking Confirmed', ?, ?, ?)`, [
          'auto-' + Date.now() + '-2',
          contactPhone,
          `Hi ${contactName}, Stall booking for ${company} (Stalls: ${stalls}) is successful. Pass ID: ${pId}.`,
          timeNow
        ], errorHandler);

        db.run('COMMIT', (errCommit) => {
          if (errCommit || hasError) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Checkout failed. Transaction rolled back.' });
          }
          res.json({ success: true, passId: pId });
        });
      });
    }
  );
});


// ──────────────── CRM TIMELINE & LOGS API ────────────────

app.get('/api/crm_timeline/:company', checkAuth(), (req, res) => {
  db.all(
    `SELECT * FROM crm_timeline WHERE company_id = ? ORDER BY timestamp DESC`,
    [req.params.company],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.get('/api/automation_logs', checkAuth(), (req, res) => {
  db.all(`SELECT * FROM automation_logs ORDER BY timestamp DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


// ──────────────── AGENDA API ────────────────

app.get('/api/agenda', (req, res) => {
  db.all(`SELECT * FROM agenda ORDER BY sort_order, start_time`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/agenda', checkAuth(['super_admin', 'admin', 'event_director']), (req, res) => {
  const { day, title, desc, speaker_id, venue, start_time, end_time, type, published, sort_order } = req.body;
  const id = 'ses-' + Date.now();
  db.run(
    `INSERT INTO agenda VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, day, title, desc, speaker_id, venue, start_time, end_time, type, published ? 1 : 0, sort_order || 0],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, sessionId: id });
    }
  );
});

app.put('/api/agenda/:id', checkAuth(['super_admin', 'admin', 'event_director']), (req, res) => {
  const { day, title, desc, speaker_id, venue, start_time, end_time, type, published, sort_order } = req.body;
  db.run(
    `UPDATE agenda SET day = ?, title = ?, desc = ?, speaker_id = ?, venue = ?, start_time = ?, end_time = ?, type = ?, published = ?, sort_order = ? WHERE id = ?`,
    [day, title, desc, speaker_id, venue, start_time, end_time, type, published ? 1 : 0, sort_order, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.delete('/api/agenda/:id', checkAuth(['super_admin', 'admin']), (req, res) => {
  db.run(`DELETE FROM agenda WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});


// ──────────────── SPEAKERS API ────────────────

app.get('/api/speakers', (req, res) => {
  db.all(`SELECT * FROM speakers`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/speakers', checkAuth(['super_admin', 'admin', 'event_director']), (req, res) => {
  const { name, designation, org, bio, linkedin, photo } = req.body;
  const id = 'spk-' + Date.now();
  db.run(
    `INSERT INTO speakers VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, name, designation, org, bio, linkedin, photo || ''],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, speakerId: id });
    }
  );
});

app.put('/api/speakers/:id', checkAuth(['super_admin', 'admin', 'event_director']), (req, res) => {
  const { name, designation, org, bio, linkedin, photo } = req.body;
  db.run(
    `UPDATE speakers SET name = ?, designation = ?, org = ?, bio = ?, linkedin = ?, photo = ? WHERE id = ?`,
    [name, designation, org, bio, linkedin, photo, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.delete('/api/speakers/:id', checkAuth(['super_admin', 'admin']), (req, res) => {
  db.run(`DELETE FROM speakers WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});


// ──────────────── SPONSORS API ────────────────

app.get('/api/sponsors', (req, res) => {
  db.all(`SELECT * FROM sponsors`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/sponsors', checkAuth(['super_admin', 'admin', 'sponsor_manager']), (req, res) => {
  const { company, type, contact_person, phone, email, amount, benefits, agreement, status } = req.body;
  const id = 'sp-' + Date.now();
  db.run(
    `INSERT INTO sponsors VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, company, type, contact_person, phone, email, amount, benefits, agreement, status || 'confirmed'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, sponsorId: id });
    }
  );
});

app.put('/api/sponsors/:id', checkAuth(['super_admin', 'admin', 'sponsor_manager']), (req, res) => {
  const { company, type, contact_person, phone, email, amount, benefits, agreement, status } = req.body;
  db.run(
    `UPDATE sponsors SET company = ?, type = ?, contact_person = ?, phone = ?, email = ?, amount = ?, benefits = ?, agreement = ?, status = ? WHERE id = ?`,
    [company, type, contact_person, phone, email, amount, benefits, agreement, status, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.delete('/api/sponsors/:id', checkAuth(['super_admin', 'admin']), (req, res) => {
  db.run(`DELETE FROM sponsors WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});


// ──────────────── SPONSOR APPLICATIONS API ────────────────

app.get('/api/sponsor_applications', checkAuth(), (req, res) => {
  db.all(`SELECT * FROM sponsor_applications`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/sponsor_applications', (req, res) => {
  const { company, contact_person, phone, email, package, industry } = req.body;
  const id = 'sp-app-' + Date.now();
  db.run(
    `INSERT INTO sponsor_applications (id, company, contact_person, phone, email, package, industry, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted')`,
    [id, company, contact_person, phone, email, package, industry || 'Renewable Energy'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, applicationId: id });
    }
  );
});

app.put('/api/sponsor_applications/:id', checkAuth(['super_admin', 'admin', 'sponsor_manager']), (req, res) => {
  const { status } = req.body;
  const id = req.params.id;

  db.get(`SELECT * FROM sponsor_applications WHERE id = ?`, [id], (err, appRow) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!appRow) return res.status(404).json({ error: 'Application not found.' });

    db.run(
      `UPDATE sponsor_applications SET status = ? WHERE id = ?`,
      [status, id],
      function(err1) {
        if (err1) return res.status(500).json({ error: err1.message });

        if (status === 'confirmed') {
          // Check if already in sponsors table
          db.get(`SELECT * FROM sponsors WHERE company = ?`, [appRow.company], (err2, existingSpons) => {
            if (err2) return res.status(500).json({ error: err2.message });
            if (existingSpons) {
              return res.json({ success: true, message: 'Application approved, sponsor already exists.' });
            }
            
            const spId = 'sp-' + Date.now();
            const packagePkg = appRow.package;
            const amount = packagePkg === 'Title' ? 1500000 : packagePkg === 'Platinum' ? 800000 : packagePkg === 'Gold' ? 500000 : packagePkg === 'Silver' ? 300000 : 200000;
            
            db.run(
              `INSERT INTO sponsors VALUES (?, ?, ?, ?, ?, ?, ?, 'Sponsorship package approved.', 'Brochure_Submitted.pdf', 'confirmed')`,
              [spId, appRow.company, packagePkg, appRow.contact_person, appRow.phone, appRow.email, amount],
              (err3) => {
                if (err3) console.error('Failed to promote to sponsors table:', err3.message);
                res.json({ success: true });
              }
            );
          });
        } else {
          res.json({ success: true });
        }
      }
    );
  });
});


// ──────────────── CAMPAIGNS API ────────────────

app.get('/api/campaigns', checkAuth(), (req, res) => {
  db.all(`SELECT * FROM campaigns`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/campaigns', checkAuth(['super_admin', 'admin']), (req, res) => {
  const { name, type, launch_date, audience, sent, delivered, opened, clicked, leads_generated } = req.body;
  const id = 'camp-' + Date.now();
  db.run(
    `INSERT INTO campaigns VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, type, launch_date, audience, leads_generated || 0, sent || 0, delivered || 0, opened || 0, clicked || 0],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, campaignId: id });
    }
  );
});


// ──────────────── INQUIRIES API ────────────────

app.get('/api/inquiries', checkAuth(), (req, res) => {
  db.all(`SELECT * FROM inquiries`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/inquiries', (req, res) => {
  const { name, company, email, phone, type, message } = req.body;
  const id = 'inq-' + Date.now();
  db.run(
    `INSERT INTO inquiries VALUES (?, ?, ?, ?, ?, ?, ?, 'new', NULL)`,
    [id, name, company || '', email, phone || '', type || 'general', message],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, inquiryId: id });
    }
  );
});

app.put('/api/inquiries/:id', checkAuth(['super_admin', 'admin', 'sales_executive']), (req, res) => {
  const { status, assigned_to } = req.body;
  db.run(
    `UPDATE inquiries SET status = ?, assigned_to = ? WHERE id = ?`,
    [status, assigned_to, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});


// ──────────────── GALLERY API ────────────────

app.get('/api/gallery', (req, res) => {
  db.all(`SELECT * FROM gallery`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/gallery', checkAuth(['super_admin', 'admin']), (req, res) => {
  const { filename, category, size, date, src } = req.body;
  const id = 'img-' + Date.now();
  db.run(
    `INSERT INTO gallery VALUES (?, ?, ?, ?, ?, ?)`,
    [id, filename, category || 'General', size || '', date || new Date().toISOString().split('T')[0], src],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, galleryId: id });
    }
  );
});


// ──────────────── DOCUMENTS API ────────────────

app.get('/api/documents', checkAuth(), (req, res) => {
  db.all(`SELECT * FROM documents`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


// ──────────────── VENUE API ────────────────

app.get('/api/venue', (req, res) => {
  db.get(`SELECT * FROM venue WHERE id = 'current'`, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
      try {
        row.assets = JSON.parse(row.assets || '{}');
      } catch (e) {
        row.assets = {};
      }
    }
    res.json(row || {});
  });
});

app.post('/api/venue', checkAuth(['super_admin', 'admin']), (req, res) => {
  const { name, address, maps_url, directions_url, parking_info, assets } = req.body;
  db.run(
    `UPDATE venue SET name = ?, address = ?, maps_url = ?, directions_url = ?, parking_info = ?, assets = ? WHERE id = 'current'`,
    [name, address, maps_url, directions_url, parking_info, JSON.stringify(assets || {})],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});


// ──────────────── SETTINGS API ────────────────

app.get('/api/settings', (req, res) => {
  db.all(`SELECT * FROM settings`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const settingsObj = {};
    rows.forEach(r => {
      settingsObj[r.key] = r.value;
    });
    res.json(settingsObj);
  });
});

app.post('/api/settings', checkAuth(['super_admin']), (req, res) => {
  const settings = req.body;
  db.serialize(() => {
    const stmt = db.prepare(`REPLACE INTO settings (key, value) VALUES (?, ?)`);
    for (const [key, value] of Object.entries(settings)) {
      stmt.run(key, String(value));
    }
    stmt.finalize((err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});


// Error Handling Middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// ──────────────── START THE SERVER ────────────────

// ──────────────── RAZORPAY INTEGRATION ────────────────

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.get('/api/config/razorpay', (req, res) => {
  res.json({ key_id: process.env.RAZORPAY_KEY_ID });
});

app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Amount must be at least 100 paise.' });
    }
    const options = {
      amount: parseInt(amount, 10),
      currency,
      receipt
    };
    const order = await razorpayInstance.orders.create(options);
    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Razorpay Error:', error);
    if (error.statusCode === 401) return res.status(401).json({ error: 'Authentication failed with Razorpay.' });
    res.status(500).json({ error: 'Failed to create order.' });
  }
});

app.post('/api/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingData } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing required Razorpay fields.' });
  }
  
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    // Payment verified successfully.
    // Insert/update in database as needed:
    // db.run(`INSERT INTO payments (order_id, payment_id, status) VALUES (?, ?, ?)`, [razorpay_order_id, razorpay_payment_id, 'PAID']);
    res.json({ success: true, message: 'Payment verified successfully.' });
  } else {
    res.status(400).json({ error: 'Signature mismatch. Payment verification failed.' });
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
