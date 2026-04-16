# AI Career Coach

A complete full-stack web application featuring 8 AI-powered career tools built with **React**, **Node.js/Express**, **MongoDB**, and **Google Gemini AI**.

---

## 🚀 Features

| Tool | Description |
|------|-------------|
| 📄 Resume Builder | AI feedback, ATS scoring, action verb suggestions |
| ✉️ Cover Letter Generator | Tailored cover letters with tone/highlight control |
| 💼 Job Recommendations | AI-matched job opportunities with match scoring |
| 🗺️ Career Path Planning | Step-by-step paths with MBTI personality analysis |
| 🎯 Skill Gap Analysis | Missing skills with prioritized learning resources |
| 📚 Learning Roadmap | Monthly structured plans with progress tracking |
| 🎤 Interview Prep | Practice Q&A with AI scoring and model answers |
| 📊 Industry Insights | Salary benchmarks, skill demand, market trends |

---

## 🏗️ Project Structure

```
ai-career-coach/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/           # Axios client
│   │   ├── components/    # Sidebar, Navbar, charts
│   │   ├── context/       # AuthContext
│   │   └── pages/         # 12 page components
└── server/                 # Node.js/Express backend
    ├── config/            # MongoDB connection
    ├── controllers/       # Business logic (10 controllers)
    ├── middleware/        # JWT auth, error handler
    ├── models/            # 9 Mongoose schemas
    ├── routes/            # Express routers
    ├── services/          # Gemini AI service
    └── tests/             # Jest tests
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local) or MongoDB Atlas account
- Google Gemini API key (free at [Google AI Studio](https://aistudio.google.com/))

---

### 1. Backend Setup

```bash
cd server
npm install
```

**Configure environment variables:**

Copy `.env.example` to `.env` and fill in your values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai_career_coach
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai_career_coach

JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_google_gemini_api_key_here

CLIENT_URL=http://localhost:5173
```

**Start the backend:**
```bash
npm run dev      # Development (with nodemon)
npm start        # Production
```

The server will run at `http://localhost:5000`.

---

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`.

> **Note:** The Vite dev server proxies `/api` requests to `http://localhost:5000` automatically.

---

### 3. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click **Get API Key** → **Create API Key**
3. Copy the key into `server/.env` as `GEMINI_API_KEY`

> **Note:** If the Gemini API key is not configured, all AI features will use built-in fallback responses so the app remains functional.

---

## 🧪 Running Tests

### Backend Tests (Jest + Supertest)
```bash
cd server
npm test
```

Tests cover:
- Health check
- User signup (success, duplicate, validation)
- Login (success, wrong password, unknown email)
- Protected routes (with/without token)
- Profile update
- Dashboard aggregation

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/signup` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Protected |
| PUT | `/api/auth/profile` | Protected |
| PUT | `/api/auth/change-password` | Protected |

### AI Features (all Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/api/resume` | Get/save resume |
| POST | `/api/resume/analyze` | AI analysis |
| POST | `/api/cover-letter/generate` | Generate letter |
| POST | `/api/jobs/generate` | Generate job matches |
| POST | `/api/career-path/generate` | Generate paths |
| POST | `/api/skill-gap/analyze` | Analyze skill gap |
| POST | `/api/roadmap/generate` | Generate roadmap |
| POST | `/api/interview/start` | Start session |
| PUT | `/api/interview/:id/answer` | Submit answer |
| POST | `/api/industry/generate` | Generate insights |
| GET | `/api/dashboard` | Dashboard data |

---

## 🎨 Design System

- **No gradients** — solid professional color palette
- `--primary`: `#1a2e4a` (Deep Navy)
- `--accent`: `#f59e0b` (Amber)
- `--success`: `#059669` (Emerald)
- Font: **Inter** + **Sora** (Google Fonts)

---

## 🔒 Security

- Passwords hashed with **bcrypt** (12 salt rounds)
- JWT tokens stored in localStorage, attached in `Authorization` header
- All API routes protected by `protect` middleware
- Input validated with **Joi** (backend) and **react-hook-form** (frontend)
- Mongoose schema-level validation

---

## 📦 Key Dependencies

### Backend
- `express` — HTTP server
- `mongoose` — MongoDB ODM
- `bcryptjs` — Password hashing
- `jsonwebtoken` — JWT auth
- `@google/generative-ai` — Gemini AI
- `joi` — Request validation
- `jest` + `supertest` — Testing

### Frontend
- `react` + `react-router-dom` — UI + routing
- `axios` — HTTP client
- `chart.js` + `react-chartjs-2` — Charts
- `react-hook-form` — Form handling
- `react-hot-toast` — Notifications
