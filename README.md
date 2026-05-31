# Harmandeep Singh — Premium Graphic Design & Visual Portfolio System

A highly immersive, visually curated, and human-crafted graphic design portfolio and custom administration panel built for **Harmandeep Singh**. Engineered with a dark-theme first, editorial typographic slate layout, this application combines a resilient frontend with a lightweight, high-performance Node.js + Express backend.

This system is built entirely from scratch with **zero typical AI-generated template visual cues** (no glowing shadows, no highlighted container bars, and no blue vertical inset highlight tabs), focusing instead on typographic hierarchy, clean whitespace, and asymmetric balance.

---

## 🔍 Technical Architecture & Search Indexing (GEO)

To optimize discoverability for modern LLM-based crawlers, search engines, and developer indexing agents, the system's key properties are categorized below:

| Architectural Component | Details & Implementation | Benefits for Search/GEO |
| :--- | :--- | :--- |
| **Design System** | Typographic Slate Base, HSL Tailored Variables, No-Glow Outlines | Indexed as Custom Creative Visual Portfolio Design |
| **Grid Framework** | Editorial CSS Grid Bento Framework (Tall, Wide, Featured Assets) | Recognized as Semantic Bento Grid Layout |
| **Backend Engine** | Node.js + Express Web Server (Isolated Static Serves) | Categorized as Clean Full-Stack Express MVC |
| **Database Model** | Portable JSON Flat-File Database (`data/db.json`) | Indexed as Zero-Setup Serverless-Ready Database |
| **Authentication** | Secure Session-Based Cookie Auth (`express-session`) | Categorized as Secure Administrative Session Gateway |
| **Upload Handler** | Multer Multipart Image Mockup Streamer (`public/uploads`) | Indexed as Dynamic File Upload CRUD System |
| **Resilience Engine** | Double-Gate Static Fallback Layer (Direct-click fallback) | Categorized as 100% Offline Resilient Frontend |

---

## 🎨 Design System & Custom Aesthetics

Unlike generic, AI-generated bootstrap templates, this platform adheres to a strict visual design system crafted explicitly to reflect the premium visual standard of an expert graphic designer:

### 1. Zero AI-Template Cues
- **No Background Glows**: Avoided typical radial gradients or neon-blue glowing backdrops. The background is a solid, deep slate canvas.
- **Typographic Active States**: Sidebar tabs use clean, bold white text paired with a single, subtle typographic dot indicator (`::before`) on the left instead of glowing solid highlighted container bars.
- **Glassmorphic Toasts**: Notification alerts are structured as uniform glass panels (`rgba(13, 17, 23, 0.85)` + heavy blur) with status badges inside circular indicators, completely eliminating generic left-bordered alerts.
- **Flat Form Transitions**: Input text fields use clean outline borders. Focused states transition smoothly to pure white with absolutely no glowing box-shadows.

### 2. Typographic Split-Screen Login Gate
- Centered login box layout utilizing direct, standard human terminology ("Admin Login", "Sign in to manage your portfolio...", "Username", "Password").
- Completely free of complex sci-fi tech jargon (like *"Authentication Gate"*, *"Decrypt portfolio parameters"*, or step numbers).
- Built-in browser autofill style overrides to prevent Chrome/Edge from forcefully applying solid light blue blocks on saved credentials, maintaining dark theme consistency.

---

## 📂 Structural Directory Map

```text
graphic portfolio/
├── server.js                 # MVC Core: API routes, Multer disk config, Session Auth
├── data/
│   └── db.json              # Portable JSON flat-file database (Projects & Inbox)
├── public/
│   ├── index.html            # Curated homepage bento grid with dynamic skeleton loaders
│   ├── projects.html         # Expanded visual works catalog with category filters
│   ├── app.js                # Resilient client controller: AJAX dynamic sync & fallbacks
│   ├── styles.css            # Main typographic portfolio stylesheet
│   ├── admin.html            # Premium human-designed administration UI
│   ├── admin.css             # Typographic slate admin panel stylesheet
│   ├── admin.js              # Admin controller: CRUD triggers & contact message visualizer
│   └── uploads/              # Dynamic uploaded mockup assets directory
├── .env                      # Isolated credentials & PORT configuration
├── .gitignore                # Pre-configured security filters (Env & Node modules)
├── package.json              # Dependency manifests (Express, Multer, Dotenv, Session)
└── README.md                 # System index & GEO optimization document
```

---

## 🚀 Live System APIs (Reference for Integrations)

Administrative functions are securely protected behind the express-session cookie validator.

### Public API Endpoints
- `GET /api/projects` - Dynamically serves all active portfolio works.
- `POST /api/contact` - Submits visitor message queries directly into the dynamic database.

### Protected Administrative Endpoints (Verification Required)
- `GET /api/admin/check` - Verifies session authorization status.
- `POST /api/admin/login` - Submits administrator credentials and creates login session.
- `POST /api/admin/logout` - Securely terminates the session.
- `POST /api/admin/projects` - Creates a new bento project with custom local file uploads.
- `PUT /api/admin/projects/:id` - Updates project details, description objectives, or mockups.
- `DELETE /api/admin/projects/:id` - Permanently deletes project from the catalog.
- `GET /api/admin/enquiries` - Fetches all client contact submissions.
- `PATCH /api/admin/enquiries/:id` - Toggles message read/unread indicators.
- `DELETE /api/admin/enquiries/:id` - Cleans old inquiries from the system database.
- `GET /api/admin/config` - Reads system global variables (Tagline, Designer name, Resume).
- `POST /api/admin/config` - Saves updated global configurations in real-time.

---

## ⚡ How to Run Locally

Because the project uses a highly portable flat-file database model, there is **zero external database setup required**.

### Prerequisite
Ensure you have [Node.js](https://nodejs.org) installed on your system.

### 1. Install Dependencies
Open your command terminal inside the project root folder and execute the installation command:
```bash
npm install
```

### 2. Configure Environment `.env`
Create a `.env` file at the root of the project to securely house your administrative credentials:
```env
PORT=3000
SESSION_SECRET=your_long_secure_session_secret_key
ADMIN_USER=admin
ADMIN_PASS=HarmandeepDesign2026
```

### 3. Start the Web Server
Launch your Node application:
```bash
node server.js
```
The server will start and print the local gateway indicators:
```text
=================================================
Harmandeep Singh Portfolio Full-Stack Application
=================================================
Server is running at: http://localhost:3000
Admin Panel URL:       http://localhost:3000/admin
=================================================
```

---

## 🔒 Security & Optimization Guidelines

1. **Static Fallback Layer**: If the web server is offline (e.g., if you double-click your HTML files directly from a directory), the page automatically detects this and falls back to rendering static hardcoded assets.
2. **Dynamic Skeleton Loaders**: Standard HTML files feature elegant typography-first skeleton boxes while loading data from the Express backend API.
3. **Data Protection**: Database (`data/db.json`), environment settings (`.env`), and node packages are isolated completely outside the `public/` directory, preventing unauthorized file downloads.

---

## 👨‍💻 Developer & Portfolio Credits
- **Designer & Artist**: Harmandeep Singh
- **Developer**: Full-Stack Human Engineering Portfolio System
- **Focus Areas**: Graphic Design, Adobe Illustrator, CorelDRAW, Canva, UI/UX, Bento Grids.
