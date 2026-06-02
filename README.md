<div align="center">
  <h1>🎯 Approach CRM</h1>
  <p>A focused job-search CRM for tracking outreach, follow-ups, and contacts — built with Next.js 14 and FastAPI.</p>

  ![License](https://img.shields.io/github/license/Saiyam-Sandhir-Jain/approach?style=flat-square)
  ![CI](https://img.shields.io/github/actions/workflow/status/Saiyam-Sandhir-Jain/approach/ci.yml?style=flat-square&label=CI)
  ![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs)
  ![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)
</div>

---

## ✨ Features

- **Application tracker** — log every outreach with stage, status, and channel
- **Smart follow-up dates** — auto-calculated based on outreach stage
- **Contact book** — attach recruiters/hiring managers to each application
- **Dashboard metrics** — response rate, overdue follow-ups, stage breakdown
- **Google OAuth** — sign in with Google; data is fully isolated per user
- **GraphQL API** — Strawberry schema with per-user data isolation

---

## 🏗 Architecture

```
approach/                  ← monorepo root
├── app/                   ← Next.js 14 App Router (frontend)
├── components/            ← Shared React components
├── lib/graphql.ts         ← GraphQL client (fetch-based)
├── types/                 ← TypeScript types
└── backend/               ← FastAPI + Strawberry GraphQL (backend)
    ├── main.py
    ├── schema.py
    ├── models.py
    └── database.py
```

**Deployment:** two separate Vercel projects from the same repo.

| Project | Root directory | Runtime |
|---------|---------------|---------|
| `approach-frontend` | `/` (repo root) | Next.js (Edge/Node) |
| `approach-backend` | `backend/` | Python 3.11 serverless |

---

## 🚀 Deploy to Vercel (step-by-step)

### Prerequisites

- A [Vercel](https://vercel.com) account (free tier works)
- A [Google Cloud](https://console.cloud.google.com) project for OAuth
- A PostgreSQL database — [Neon](https://neon.tech) free tier recommended

---

### Step 1 — Set up a PostgreSQL database (Neon, free)

1. Go to [neon.tech](https://neon.tech) → **New project** → give it a name.
2. After creation, copy the **Connection string** that looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Save this — you'll use it as `DATABASE_URL` for the backend.

---

### Step 2 — Create Google OAuth credentials

1. Open [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services** → **Credentials**.
2. Click **Create Credentials** → **OAuth 2.0 Client ID**.
3. Application type: **Web application**.
4. Under **Authorized redirect URIs**, add **both**:
   ```
   http://localhost:3000/api/auth/callback/google
   https://<your-frontend-domain>.vercel.app/api/auth/callback/google
   ```
   (Replace `<your-frontend-domain>` after you deploy the frontend — you can come back and add it.)
5. Click **Create** and copy:
   - **Client ID** → `GOOGLE_CLIENT_ID`
   - **Client Secret** → `GOOGLE_CLIENT_SECRET`

---

### Step 3 — Deploy the backend to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) → **Import** your GitHub repo.
2. **Before clicking Deploy**, set the root directory:
   - Click **Edit** next to Root Directory → type `backend` → **Save**.
3. Under **Environment Variables**, add:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | your Neon connection string |

4. Click **Deploy**.
5. After deployment, copy the URL — it will look like `https://approach-backend-xxx.vercel.app`.
   This is your `NEXT_PUBLIC_GRAPHQL_URL` (append `/graphql`):
   ```
   https://approach-backend-xxx.vercel.app/graphql
   ```

> **Verify it works:** visit `https://approach-backend-xxx.vercel.app/health` — you should see `{"status":"ok"}`.

---

### Step 4 — Deploy the frontend to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) → **Import** the same GitHub repo again (Vercel allows multiple projects per repo).
2. This time, leave the root directory as **`/`** (the repo root).
3. Framework preset: **Next.js** (auto-detected).
4. Under **Environment Variables**, add all of these:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_GRAPHQL_URL` | `https://approach-backend-xxx.vercel.app/graphql` |
   | `GOOGLE_CLIENT_ID` | from Step 2 |
   | `GOOGLE_CLIENT_SECRET` | from Step 2 |
   | `NEXTAUTH_SECRET` | run `openssl rand -base64 32` locally and paste the output |
   | `NEXTAUTH_URL` | `https://<your-frontend-domain>.vercel.app` |

5. Click **Deploy**.
6. Copy your frontend URL (e.g. `https://approach-frontend-xxx.vercel.app`).

---

### Step 5 — Finish Google OAuth setup

1. Go back to [Google Cloud Console](https://console.cloud.google.com) → **Credentials** → your OAuth client.
2. Add your real frontend URL to **Authorized redirect URIs**:
   ```
   https://approach-frontend-xxx.vercel.app/api/auth/callback/google
   ```
3. Save.

---

### Step 6 — Fix backend CORS

In `backend/main.py`, update the `allow_origins` list to include your frontend URL:

```python
allow_origins=[
    "http://localhost:3000",
    "https://*.vercel.app",
    "https://approach-frontend-xxx.vercel.app",   # ← add your exact domain
],
```

Commit and push — both Vercel projects will redeploy automatically.

---

### Step 7 — Test it end-to-end

1. Visit your frontend URL.
2. Click **Sign in with Google**.
3. Create your first application. ✅

---

## 💻 Local Development

```bash
# 1. Clone
git clone https://github.com/Saiyam-Sandhir-Jain/approach.git
cd approach

# 2. Frontend setup
npm install
cp .env.local.example .env.local
# Edit .env.local with your Google credentials

# 3. Backend setup
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
# Optional: set DATABASE_URL in backend/.env (defaults to SQLite)

# 4. Run both
# Terminal 1 (backend):
uvicorn main:app --reload --port 8000

# Terminal 2 (frontend, from repo root):
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

GraphiQL playground: [http://localhost:8000/graphql](http://localhost:8000/graphql)

---

## 🔧 Environment Variables Reference

### Frontend (`.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GRAPHQL_URL` | Full URL to the GraphQL endpoint |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `NEXTAUTH_SECRET` | Random 32-byte base64 string (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Your frontend URL (`http://localhost:3000` in dev) |

### Backend (`backend/.env` or Vercel env vars)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLAlchemy connection string. SQLite in dev, PostgreSQL in prod. |

---

## 🗄 Database

The backend uses **SQLAlchemy** and supports any SQLAlchemy-compatible database:

- **Local dev:** SQLite (default, zero config, file `backend/crm.db`)
- **Production:** PostgreSQL via `DATABASE_URL`

Tables are created automatically on startup via `create_tables()`.

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, coding conventions, and the PR process.

---

## 📄 License

[MIT](LICENSE) © 2024 Saiyam Jain
