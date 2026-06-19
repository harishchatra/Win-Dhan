const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, 'ire_expo.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Run schemas creation in sequence
db.serialize(() => {
  // 1. Users Table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL
  )`);

  // 2. Stalls Table
  db.run(`CREATE TABLE IF NOT EXISTS stalls (
    id TEXT PRIMARY KEY,
    block TEXT NOT NULL,
    category TEXT NOT NULL,
    size TEXT NOT NULL,
    price REAL NOT NULL,
    status TEXT DEFAULT 'available',
    assigned_company TEXT
  )`);

  // 3. Leads Table
  db.run(`CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    segment TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    city TEXT,
    state TEXT,
    assigned_to TEXT,
    source TEXT,
    status TEXT DEFAULT 'new',
    notes TEXT,
    lead_score TEXT DEFAULT 'Cold'
  )`);

  // 4. Exhibitors Table
  db.run(`CREATE TABLE IF NOT EXISTS exhibitors (
    id TEXT PRIMARY KEY,
    company TEXT UNIQUE NOT NULL,
    gstin TEXT,
    contact_person TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT,
    website TEXT,
    category TEXT,
    assigned_stall TEXT,
    logo_path TEXT,
    status TEXT DEFAULT 'active'
  )`);

  // 5. Payments Table
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    stall_number TEXT NOT NULL,
    amount REAL NOT NULL,
    gst REAL NOT NULL,
    total REAL NOT NULL,
    paid REAL DEFAULT 0,
    pending REAL NOT NULL,
    due_date TEXT,
    status TEXT DEFAULT 'pending',
    payment_ref TEXT,
    payment_history TEXT DEFAULT '[]'
  )`);

  // 6. Visitors Table
  db.run(`CREATE TABLE IF NOT EXISTS visitors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL,
    designation TEXT NOT NULL,
    city TEXT,
    state TEXT,
    type TEXT,
    status TEXT DEFAULT 'registered',
    reg_date TEXT
  )`);

  // 7. Sponsor Applications Table
  db.run(`CREATE TABLE IF NOT EXISTS sponsor_applications (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    package TEXT NOT NULL,
    industry TEXT,
    status TEXT DEFAULT 'submitted'
  )`);

  // 7b. Sponsors Table
  db.run(`CREATE TABLE IF NOT EXISTS sponsors (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    type TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    amount REAL NOT NULL,
    benefits TEXT,
    agreement TEXT,
    status TEXT DEFAULT 'confirmed'
  )`);

  // 8. Meetings Table
  db.run(`CREATE TABLE IF NOT EXISTS meetings (
    id TEXT PRIMARY KEY,
    visitor_name TEXT NOT NULL,
    visitor_email TEXT NOT NULL,
    exhibitor_id TEXT NOT NULL,
    exhibitor_name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    notes TEXT
  )`);

  // 9. Tasks Table
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    priority TEXT NOT NULL,
    deadline TEXT NOT NULL,
    assigned_user TEXT,
    category TEXT,
    status TEXT DEFAULT 'Pending'
  )`);

  // 9b. Admin Notifications Table (for Super Admin task completion alerts)
  db.run(`CREATE TABLE IF NOT EXISTS admin_notifications (
    id TEXT PRIMARY KEY,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'task',
    completed_by TEXT,
    task_title TEXT,
    task_id TEXT,
    timestamp TEXT NOT NULL,
    is_read INTEGER DEFAULT 0
  )`);

  // 10. CRM Timeline Table
  db.run(`CREATE TABLE IF NOT EXISTS crm_timeline (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    type TEXT NOT NULL,
    details TEXT,
    timestamp TEXT NOT NULL,
    created_by TEXT
  )`);

  // 11. Automation Logs Table
  db.run(`CREATE TABLE IF NOT EXISTS automation_logs (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    trigger_event TEXT NOT NULL,
    recipient TEXT NOT NULL,
    message_body TEXT,
    timestamp TEXT NOT NULL
  )`);

  // 12. Documents Repository Table
  db.run(`CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    upload_date TEXT NOT NULL,
    file_size TEXT NOT NULL,
    company_id TEXT
  )`);

  // 13. Speakers Table
  db.run(`CREATE TABLE IF NOT EXISTS speakers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    designation TEXT,
    org TEXT,
    bio TEXT,
    linkedin TEXT,
    photo TEXT
  )`);

  // 14. Agenda Sessions Table
  db.run(`CREATE TABLE IF NOT EXISTS agenda (
    id TEXT PRIMARY KEY,
    day INTEGER NOT NULL,
    title TEXT NOT NULL,
    desc TEXT,
    speaker_id TEXT,
    venue TEXT,
    start_time TEXT,
    end_time TEXT,
    type TEXT,
    published INTEGER DEFAULT 1,
    sort_order INTEGER
  )`);

  // 15. Campaigns Table
  db.run(`CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    launch_date TEXT,
    audience TEXT,
    leads_generated INTEGER DEFAULT 0,
    sent INTEGER DEFAULT 0,
    delivered INTEGER DEFAULT 0,
    opened INTEGER DEFAULT 0,
    clicked INTEGER DEFAULT 0
  )`);

  // 16. Website Inquiries Table
  db.run(`CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    type TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    assigned_to TEXT
  )`);

  // 17. Media Gallery Table
  db.run(`CREATE TABLE IF NOT EXISTS gallery (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    category TEXT,
    size TEXT,
    date TEXT,
    src TEXT
  )`);

  // 18. Venue Table
  db.run(`CREATE TABLE IF NOT EXISTS venue (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    maps_url TEXT,
    directions_url TEXT,
    parking_info TEXT,
    assets TEXT
  )`);

  // 19. Settings Table
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )`);

  // ── Remove old test/dummy accounts on every boot ──
  db.run(`DELETE FROM users WHERE username IN ('hari', 'manager', 'raju')`, (delErr) => {
    if (delErr) console.error('Error removing old test accounts:', delErr.message);
    else console.log('Old test accounts removed.');
  });

  // ── Seed real team accounts (only if they don't already exist) ──
  const teamMembers = [
    {
      id: 'u_harish',
      name: 'Harish Chatra',
      username: '@harishchatra',
      password: '7981869954',
      role: 'super_admin'
    },
    {
      id: 'u_sadanand',
      name: 'Sadanand',
      username: 'sadanand',
      password: 'Sadanand@IRE26',
      role: 'sales_manager'       // Leads, Exhibitors, Reports (for invoices/billing)
    },
    {
      id: 'u_renu',
      name: 'Renu',
      username: 'renu',
      password: 'Renu@IRE26',
      role: 'finance_manager'     // Stalls, Payments, Reports
    },
    {
      id: 'u_sandeep',
      name: 'Sandeep',
      username: 'sandeep',
      password: 'Sandeep@IRE26',
      role: 'sponsor_manager'     // Tasks, Media, limited dashboard access
    },
    {
      id: 'u_chanti',
      name: 'Chanti',
      username: 'chanti',
      password: 'Chanti@IRE26',
      role: 'sales_manager'       // Marketing campaigns, Leads (colleges/influencers)
    }
  ];

  teamMembers.forEach(member => {
    db.get(`SELECT * FROM users WHERE username = ?`, [member.username], (err, existing) => {
      if (err) { console.error(`Error checking user ${member.username}:`, err.message); return; }
      if (!existing) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(member.password, salt);
        db.run(
          `INSERT INTO users (id, name, username, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
          [member.id, member.name, member.username, hash, member.role],
          (insErr) => {
            if (insErr) console.error(`Failed to seed ${member.name}:`, insErr.message);
            else console.log(`✅ Team member seeded: ${member.name} (${member.role})`);
          }
        );
      }
    });
  });


  // Seed Stalls (Seed all 85 stalls completely available!)
  db.get(`SELECT COUNT(*) as count FROM stalls`, (err, row) => {
    if (row && row.count === 0) {
      console.log('Seeding 85 available stalls...');
      
      // Block A (10 stalls, Gold, 9m x 5.7m, 7.5L)
      for (let i = 1; i <= 10; i++) {
        db.run(`INSERT INTO stalls VALUES (?, 'A', 'Gold', '9m x 5.7m', 750000, 'available', NULL)`, [`A-${i}`]);
      }
      
      // Block B (18 stalls, Standard, 10ft x 10ft, 1.36L)
      for (let i = 1; i <= 18; i++) {
        db.run(`INSERT INTO stalls VALUES (?, 'B', 'Standard', '10ft x 10ft', 136000, 'available', NULL)`, [`B-${i}`]);
      }
      
      // Block C (12 stalls, Standard, 10ft x 20ft, 2.00L)
      for (let i = 1; i <= 12; i++) {
        db.run(`INSERT INTO stalls VALUES (?, 'C', 'Standard', '10ft x 20ft', 200000, 'available', NULL)`, [`C-${i}`]);
      }
      
      // Block D (36 stalls, Diamond, 8ft x 8ft, 1.00L)
      const dLetters = ['a', 'b', 'c', 'd', 'e', 'f'];
      for (let u = 1; u <= 6; u++) {
        dLetters.forEach(letter => {
          db.run(`INSERT INTO stalls VALUES (?, 'D', 'Diamond', '8ft x 8ft', 100000, 'available', NULL)`, [`D-${u}-${letter}`]);
        });
      }
      
      // Block E (9 stalls, Standard & VIP, 8ft x 8ft)
      for (let i = 1; i <= 9; i++) {
        let price = i <= 5 ? 136000 : 250000;
        let cat = i <= 5 ? 'Standard' : 'VIP';
        db.run(`INSERT INTO stalls VALUES (?, 'E', ?, '8ft x 8ft', ?, 'available', NULL)`, [`E-${i}`, cat, price]);
      }
    }
  });

  // Clear and seed real Agendas on boot
  db.run(`DELETE FROM agenda`, (err) => {
    if (err) {
      console.error('Error clearing agenda table:', err);
    } else {
      console.log('Seeding official agenda sessions...');
      const day1Desc = `
        <p style="margin-bottom: 0.6rem; font-weight: 600; color: #112A18;">A full-day exhibition featuring the latest innovations and solutions in:</p>
        <ul style="margin-left: 1.25rem; margin-bottom: 0.8rem; list-style-type: disc; display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; font-size: 0.8rem;">
          <li>Electric Vehicles (EV)</li>
          <li>Battery Energy Storage (BESS)</li>
          <li>Solar Energy</li>
          <li>Wind Energy</li>
          <li>Smart Energy Technologies</li>
          <li>Sustainable Infrastructure</li>
        </ul>
        <p>Visitors can explore exhibitor stalls, live demonstrations, product launches, and networking opportunities with industry leaders.</p>
      `;
      const day2DebateDesc = `
        <p style="margin-bottom: 0.6rem; font-weight: 600; color: #112A18;">Key discussions and expert debates on:</p>
        <ul style="margin-left: 1.25rem; margin-bottom: 0.8rem; list-style-type: disc; display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; font-size: 0.8rem;">
          <li>Battery Energy Storage (BESS)</li>
          <li>Electric Vehicles (EV)</li>
          <li>Solar Energy</li>
          <li>Wind Energy</li>
          <li>Renewable Energy Policy</li>
          <li>Future Energy Tech &amp; Sustainability</li>
        </ul>
        <p>Industry experts, government representatives, policymakers, and business leaders will share insights on the future of India's clean energy ecosystem.</p>
      `;
      
      db.run(`INSERT INTO agenda VALUES ('ses-1', 1, 'Expo & Technology Showcase', ?, 'All Registered Visitors & Industry Leaders', 'HMDA Grounds, Hyderabad', '11:00 AM', '06:30 PM', 'Exhibition', 1, 1)`, [day1Desc]);
      db.run(`INSERT INTO agenda VALUES ('ses-2', 2, 'Expo Gates Open', 'General exhibition gates are open from 11:00 AM to 6:30 PM for all registered attendees.', 'Visitors & Delegates', 'HMDA Grounds Entrance', '11:00 AM', '06:30 PM', 'Expo Timings', 1, 1)`);
      db.run(`INSERT INTO agenda VALUES ('ses-3', 2, 'Industry Leadership Debate & Panel Discussion', ?, 'Industry Experts, Policy Makers & Government Representatives', 'Main Conference Hall', '11:30 AM', '02:00 PM', 'Featured Debate', 1, 2)`, [day2DebateDesc]);
      db.run(`INSERT INTO agenda VALUES ('ses-4', 2, 'Expo & Networking Session', 'Continue exploring exhibitor showcases, technology demonstrations, business networking opportunities, and industry collaborations.', 'Delegates, Exhibitors & Visitors', 'Exhibition Floor', '02:00 PM', '06:30 PM', 'Networking', 1, 3)`);
    }
  });

  // Seed Speakers
  db.get(`SELECT COUNT(*) as count FROM speakers`, (err, row) => {
    if (row && row.count === 0) {
      console.log('Seeding default speakers...');
      db.run(`INSERT INTO speakers VALUES ('spk-1', 'Dr. G. Girish', 'Secretary MNRE', 'Ministry of New & Renewable Energy', 'Dr. Girish handles clean energy policy frameworks.', 'https://linkedin.com/in/dr-girish-mnre', '')`);
      db.run(`INSERT INTO speakers VALUES ('spk-2', 'Harish Roy', 'VP EV systems', 'Tata Motors Green Ltd', 'Harish leads the electric drivetrains development.', 'https://linkedin.com/in/harish-roy-tata', '')`);
      db.run(`INSERT INTO speakers VALUES ('spk-3', 'Prof. Rakesh Rao', 'HOD Energy Engineering', 'Osmania University', 'Prof. Rao leads battery storage materials research.', 'https://linkedin.com/in/rakesh-rao-ou', '')`);
    }
  });

  // Seed Campaigns
  db.get(`SELECT COUNT(*) as count FROM campaigns`, (err, row) => {
    if (row && row.count === 0) {
      console.log('Seeding default campaigns...');
      db.run(`INSERT INTO campaigns VALUES ('camp-1', 'WhatsApp Past Registrants Blast', 'WhatsApp', '2026-05-10', 'IRE 2025 past attendees (3000 contacts)', 142, 3000, 2985, 2820, 890)`);
      db.run(`INSERT INTO campaigns VALUES ('camp-2', 'LinkedIn Clean Energy CEOs Ads', 'LinkedIn', '2026-05-15', 'Solar & EV Directors in India', 28, 500, 500, 410, 180)`);
      db.run(`INSERT INTO campaigns VALUES ('camp-3', 'Email Corporate Sponsor pitches', 'Email', '2026-05-20', 'MSME and PSU marketing list', 12, 800, 782, 360, 95)`);
    }
  });

  // Seed default Media Gallery
  db.get(`SELECT COUNT(*) as count FROM gallery`, (err, row) => {
    if (row && row.count === 0) {
      db.run(`INSERT INTO gallery VALUES ('img-1', 'exhibition_hall_aerial.jpg', 'Venue Photos', '1.2 MB', '2026-06-01', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&q=80')`);
      db.run(`INSERT INTO gallery VALUES ('img-2', 'tata_motors_booth.jpg', 'Sponsor Photos', '940 KB', '2026-06-01', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=300&q=80')`);
    }
  });

  // Seed default Venue info
  db.get(`SELECT COUNT(*) as count FROM venue`, (err, row) => {
    if (row && row.count === 0) {
      console.log('Seeding default venue...');
      const assets = JSON.stringify({
        floor_plan: { name: 'ire_hall_layout_v2.png', size: '2.4 MB', date: '2026-06-01' },
        venue_image: { name: 'peoples_plaza_grounds.jpg', size: '1.8 MB', date: '2026-06-01' },
        venue_map: null,
        parking_map: null
      });
      db.run(`INSERT INTO venue VALUES ('current', 'HMDA Grounds, Peoples Plaza, Hyderabad', 'Adjacent to IMAX Theatre & Peoples Plaza, NTR Marg, Hyderabad, Telangana 500004', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.1264267499696!2d78.4682071!3d17.4057262!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9746ecf53995%3A0xe54e60ea9b2401f8!2sPeoples%20Plaza!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin', 'https://maps.app.goo.gl/d2Y8r4fMeb1Y8z7eA', 'Dedicated corporate parking grid adjacent to NTR Gardens entry. Total capacity: 500 cars (with EV charging terminals).', ?)`, [assets]);
    }
  });

  // Seed default Settings
  db.get(`SELECT COUNT(*) as count FROM settings`, (err, row) => {
    if (row && row.count === 0) {
      console.log('Seeding default settings...');
      db.run(`INSERT INTO settings VALUES ('ire_reg_open', 'true')`);
      db.run(`INSERT INTO settings VALUES ('ire_reg_limit', '5000')`);
      db.run(`INSERT INTO settings VALUES ('ire_reg_approval', 'false')`);
      db.run(`INSERT INTO settings VALUES ('ire_reg_qr', 'true')`);
      db.run(`INSERT INTO settings VALUES ('ire_reg_email', 'true')`);
      db.run(`INSERT INTO settings VALUES ('ire_content_hero_title', 'India Renewable<br>Energy <span>Expo 2026</span>')`);
      db.run(`INSERT INTO settings VALUES ('ire_content_about_text', 'IRE 2026 is a premier Renewable Energy & Electric Mobility exhibition co-organized by Dhan Enterprise and Suprabha Trust. Designed as a key convergence node, the expo brings together state ministries, nodal bodies, central PSUs, global technology manufacturers, dealers, and corporate investors to network, trade, and exchange insights.')`);
    }
  });

  // Seed default Sponsors
  db.get(`SELECT COUNT(*) as count FROM sponsors`, (err, row) => {
    if (row && row.count === 0) {
      console.log('Seeding default sponsors...');
      db.run(`INSERT INTO sponsors VALUES ('sp-1', 'Tata Motors Green', 'Title Sponsor', 'Harish Roy', '9849446409', 'harish@tata.com', 1500000, 'Logo on all entry passes, 2 premium VIP block slots, keynote inauguration slot.', 'Tata_Title_Sponsor_IRE2026.pdf', 'paid')`);
      db.run(`INSERT INTO sponsors VALUES ('sp-2', 'Premier Solar Systems', 'Platinum', 'Sumit Lal', '9123400000', 'sumit@premier.com', 800000, 'Logo on main entry arch, 1 standard booth slot, brand brochure insertion.', 'Premier_Platinum_IRE2026.pdf', 'confirmed')`);
      db.run(`INSERT INTO sponsors VALUES ('sp-3', 'Waaree PV modules', 'Gold', 'Jignesh Patel', '9876543210', 'jignesh@waaree.com', 500000, 'Logo on conference backdrops, media room session sponsorships.', 'Waaree_Gold_IRE2026.pdf', 'negotiation')`);
      db.run(`INSERT INTO sponsors VALUES ('sp-4', 'Osmania University', 'Knowledge Partner', 'Registrar Office', '8331900000', 'registrar@osmania.edu', 200000, 'Logo on research posters panels, delegate badge cards layout.', 'Osmania_MOU_2026.pdf', 'confirmed')`);
    }
  });

  // Seed default Sponsor Applications
  db.get(`SELECT COUNT(*) as count FROM sponsor_applications`, (err, row) => {
    if (row && row.count === 0) {
      console.log('Seeding default sponsor applications...');
      db.run(`INSERT INTO sponsor_applications VALUES ('sp-app-1', 'Renewable Tech India', 'Sanjay Dutt', '9876543211', 'sanjay@renewtech.in', 'Gold', 'Solar Manufacturing', 'submitted')`);
      db.run(`INSERT INTO sponsor_applications VALUES ('sp-app-2', 'EV Charge Solutions', 'Nisha Sharma', '9123456789', 'nisha@evcharge.com', 'Silver', 'EV charging network', 'submitted')`);
    }
  });
});

module.exports = db;

