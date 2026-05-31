require('dotenv').config();
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Path declarations
const DB_FILE = path.join(__dirname, 'data', 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// Ensure uploads folders exist safely (gated for read-only Serverless environments)
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('Warning: Could not create uploads directory (expected in read-only Serverless environments):', err.message);
}

// Helper to read database
function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON database, resetting database structure...', err);
    return { projects: [], enquiries: [], config: {} };
  }
}

// Helper to write database
function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing to JSON database...', err);
    return false;
  }
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session config
app.use(session({
  secret: process.env.SESSION_SECRET || 'harmandeep_portfolio_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Multer Storage Configuration for visual mockup uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Serve static assets from public/ folder
app.use(express.static(path.join(__dirname, 'public')));

// Authentication Middleware to protect administrative APIs
function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized. Administrative access required.' });
  }
}

/* ==========================================
   1. PUBLIC USER APIS
   ========================================== */

// Get all projects for frontend rendering
app.get('/api/projects', (req, res) => {
  const db = readDB();
  res.json(db.projects || []);
});

// Submit a new contact form enquiry
app.post('/api/contact', (req, res) => {
  const { name, email, details } = req.body;
  if (!name || !email || !details) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const db = readDB();
  const newEnquiry = {
    id: Date.now(),
    name: name.trim(),
    email: email.trim(),
    details: details.trim(),
    timestamp: new Date().toISOString(),
    read: false
  };

  db.enquiries = db.enquiries || [];
  db.enquiries.unshift(newEnquiry); // newest message first
  writeDB(db);

  res.status(201).json({ success: true, message: 'Message recorded successfully!' });
});

/* ==========================================
   2. AUTHENTICATION SERVICES
   ========================================== */

// Check login status
app.get('/api/admin/check', (req, res) => {
  res.json({ loggedIn: !!(req.session && req.session.isAdmin) });
});

// Login action
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const expectedUser = process.env.ADMIN_USER || 'admin';
  const expectedPass = process.env.ADMIN_PASS || 'HarmandeepDesign2026';

  if (username === expectedUser && password === expectedPass) {
    req.session.isAdmin = true;
    res.json({ success: true, message: 'Welcome back, Harmandeep!' });
  } else {
    res.status(400).json({ error: 'Invalid designer credentials.' });
  }
});

// Logout action
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Failed to clear session.' });
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  });
});

/* ==========================================
   3. ADMIN PROJECTS MANAGEMENT (CRUD)
   ========================================== */

// Create a new project (includes optional mockup upload)
app.post('/api/admin/projects', requireAuth, upload.single('imageFile'), (req, res) => {
  const { title, subtitle, category, objective, outcome, featured, layout } = req.body;
  
  if (!title || !category) {
    return res.status(400).json({ error: 'Title and category are required.' });
  }

  const db = readDB();
  
  // Resolve image filename
  let imgFilename = 'aura_branding.png'; // default placeholder
  if (req.file) {
    imgFilename = req.file.filename;
  } else if (req.body.imageUrl) {
    imgFilename = req.body.imageUrl;
  }

  const newProject = {
    id: Date.now(),
    title: title.trim(),
    subtitle: (subtitle || '').trim(),
    category: category.trim(),
    img: imgFilename,
    objective: (objective || '').trim(),
    outcome: (outcome || '').trim(),
    featured: featured === 'true' || featured === true,
    layout: layout || 'bento-featured',
    date: new Date().toISOString().split('T')[0]
  };

  db.projects = db.projects || [];
  db.projects.push(newProject);
  writeDB(db);

  res.status(201).json({ success: true, project: newProject });
});

// Update an existing project
app.put('/api/admin/projects/:id', requireAuth, upload.single('imageFile'), (req, res) => {
  const projectId = parseInt(req.params.id);
  const { title, subtitle, category, objective, outcome, featured, layout } = req.body;

  const db = readDB();
  const projectIdx = db.projects.findIndex(p => p.id === projectId);

  if (projectIdx === -1) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const existingProj = db.projects[projectIdx];

  // Resolve new image mockup
  let imgFilename = existingProj.img;
  if (req.file) {
    imgFilename = req.file.filename;
  } else if (req.body.imageUrl) {
    imgFilename = req.body.imageUrl;
  }

  const updatedProject = {
    ...existingProj,
    title: title ? title.trim() : existingProj.title,
    subtitle: subtitle !== undefined ? subtitle.trim() : existingProj.subtitle,
    category: category ? category.trim() : existingProj.category,
    img: imgFilename,
    objective: objective !== undefined ? objective.trim() : existingProj.objective,
    outcome: outcome !== undefined ? outcome.trim() : existingProj.outcome,
    featured: featured !== undefined ? (featured === 'true' || featured === true) : existingProj.featured,
    layout: layout || existingProj.layout
  };

  db.projects[projectIdx] = updatedProject;
  writeDB(db);

  res.json({ success: true, project: updatedProject });
});

// Delete a project
app.delete('/api/admin/projects/:id', requireAuth, (req, res) => {
  const projectId = parseInt(req.params.id);
  const db = readDB();
  
  const updatedProjects = db.projects.filter(p => p.id !== projectId);
  
  if (db.projects.length === updatedProjects.length) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  db.projects = updatedProjects;
  writeDB(db);

  res.json({ success: true, message: 'Project deleted successfully.' });
});

/* ==========================================
   4. ENQUIRY INBOX MANAGEMENT
   ========================================== */

// Get all enquiries
app.get('/api/admin/enquiries', requireAuth, (req, res) => {
  const db = readDB();
  res.json(db.enquiries || []);
});

// Toggle or edit read status of an enquiry
app.patch('/api/admin/enquiries/:id', requireAuth, (req, res) => {
  const enquiryId = parseInt(req.params.id);
  const { read } = req.body;

  const db = readDB();
  const enquiry = db.enquiries.find(e => e.id === enquiryId);

  if (!enquiry) {
    return res.status(404).json({ error: 'Enquiry not found.' });
  }

  enquiry.read = read !== undefined ? !!read : !enquiry.read;
  writeDB(db);

  res.json({ success: true, enquiry });
});

// Delete an enquiry
app.delete('/api/admin/enquiries/:id', requireAuth, (req, res) => {
  const enquiryId = parseInt(req.params.id);
  const db = readDB();

  const updatedEnquiries = db.enquiries.filter(e => e.id !== enquiryId);

  if (db.enquiries.length === updatedEnquiries.length) {
    return res.status(404).json({ error: 'Enquiry not found.' });
  }

  db.enquiries = updatedEnquiries;
  writeDB(db);

  res.json({ success: true, message: 'Enquiry removed from inbox.' });
});

/* ==========================================
   5. GENERAL SYSTEM CONFIGURATION
   ========================================== */

// Get system config
app.get('/api/admin/config', (req, res) => {
  const db = readDB();
  res.json(db.config || {});
});

// Update system configuration
app.post('/api/admin/config', requireAuth, (req, res) => {
  const { designerName, tagline, resumeUrl } = req.body;
  const db = readDB();

  db.config = db.config || {};
  if (designerName) db.config.designerName = designerName.trim();
  if (tagline) db.config.tagline = tagline.trim();
  if (resumeUrl) db.config.resumeUrl = resumeUrl.trim();

  writeDB(db);
  res.json({ success: true, config: db.config });
});

// Explicit route for the administration panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Fallback to serve index.html for undefined frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export the Express app instance for Vercel Serverless Functions
module.exports = app;

// Start the port listener only if running locally (e.g., node server.js)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`Harmandeep Singh Portfolio Full-Stack Application`);
    console.log(`=================================================`);
    console.log(`Server is running at: http://localhost:${PORT}`);
    console.log(`Admin Panel URL:       http://localhost:${PORT}/admin`);
    console.log(`Default login user:   admin`);
    console.log(`Default login pass:   HarmandeepDesign2026`);
    console.log(`=================================================\n`);
  });
}
