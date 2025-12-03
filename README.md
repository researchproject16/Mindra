# Mindra
```markdown
# Mindra — Minimal JavaScript Starter

Mindra is a minimal starter for an educational website with:
- User accounts and JWT auth
- Modules (lessons) and quizzes
- Progress tracking
- Simple analytics recording
- React frontend (Vite) + Express backend (lowdb JSON store)

This scaffold is intentionally small so you can extend it quickly.

Prerequisites
- Node.js 16+
- npm

Quick start (local)
1. Clone or copy this repo into a folder `mindra`.
2. Install all dependencies:
   npm run install-all
3. Start dev servers (runs backend and frontend concurrently):
   npm run dev
4. Open the frontend at http://localhost:5173
   Backend API runs on http://localhost:4000

Seeded accounts (for testing)
- Email: alice@example.com / Password: password123
- Email: bob@example.com / Password: password123

What’s included
- server/: Express API with endpoints:
  - POST /api/register
  - POST /api/login
  - GET /api/modules
  - GET /api/modules/:id
  - GET /api/quiz/:moduleId
  - POST /api/submit (submit quiz answers, update progress, record analytics)
  - GET /api/progress (protected)
- client/: React + Vite UI with basic pages:
  - Login / Register
  - Dashboard (list of modules)
  - Module view with lesson content and quiz

Next steps / ideas to add
- Replace lowdb with PostgreSQL / MongoDB for production.
- Add server-side validation and rate limiting.
- Add email verification / password reset.
- Add file-based CMS or integrate a headless CMS (Strapi, Sanity).
- Add analytics dashboard, charts, and admin UI.
- Add tests and CI (GitHub Actions) and deploy to Vercel/Netlify + Heroku / Render / Fly for the server.

Notes
- Secrets are stored in server/.env (for demo defaults are baked in; change before production).
- This is a starter — expand modules/quizzes and improve UI/UX as needed.
```
