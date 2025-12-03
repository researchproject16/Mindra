const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Low, JSONFile } = require('lowdb');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'db.json');
const adapter = new JSONFile(DB_PATH);
const db = new Low(adapter);

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_for_mindra';
const JWT_EXPIRES = '7d';

// load DB once
async function initDb() {
  await db.read();
  db.data = db.data || { users: [], modules: [], progress: [], analytics: [] };
  // For convenience: if there are no users, add a default alice/bob with password "password123"
  if (db.data.users.length === 0) {
    const hash = bcrypt.hashSync('password123', 10);
    db.data.users.push({ id: 'user_alice', email: 'alice@example.com', passwordHash: hash });
    db.data.users.push({ id: 'user_bob', email: 'bob@example.com', passwordHash: hash });
    await db.write();
  }
}
initDb();

// Helpers
function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

async function getUserByEmail(email) {
  await db.read();
  return db.data.users.find(u => u.email === email);
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid Authorization format' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Routes
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  await db.read();
  if (db.data.users.find(u => u.email === email)) return res.status(409).json({ error: 'User exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = { id: `user_${nanoid(8)}`, email, passwordHash: hash };
  db.data.users.push(user);
  await db.write();
  const token = signToken(user);
  res.json({ token, user: { id: user.id, email: user.email } });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  await db.read();
  const user = db.data.users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken(user);
  res.json({ token, user: { id: user.id, email: user.email } });
});

app.get('/api/modules', async (req, res) => {
  await db.read();
  const modules = db.data.modules.map(m => ({ id: m.id, title: m.title, level: m.level }));
  res.json(modules);
});

app.get('/api/modules/:id', async (req, res) => {
  await db.read();
  const mod = db.data.modules.find(m => m.id === req.params.id);
  if (!mod) return res.status(404).json({ error: 'Module not found' });
  res.json({ id: mod.id, title: mod.title, level: mod.level, content: mod.content });
});

app.get('/api/quiz/:moduleId', async (req, res) => {
  await db.read();
  const mod = db.data.modules.find(m => m.id === req.params.moduleId);
  if (!mod) return res.status(404).json({ error: 'Module not found' });
  // hide correct answers
  const quiz = mod.quiz.map(q => ({ id: q.id, text: q.text, options: q.options }));
  res.json(quiz);
});

app.post('/api/submit', authMiddleware, async (req, res) => {
  const { moduleId, answers } = req.body || {}; // answers: [{qId, selectedIndex}]
  if (!moduleId || !Array.isArray(answers)) return res.status(400).json({ error: 'moduleId and answers required' });
  await db.read();
  const mod = db.data.modules.find(m => m.id === moduleId);
  if (!mod) return res.status(404).json({ error: 'Module not found' });

  // grade
  let correct = 0;
  for (const a of answers) {
    const q = mod.quiz.find(q => q.id === a.qId);
    if (q && q.answerIndex === a.selectedIndex) correct++;
  }
  const score = Math.round((correct / mod.quiz.length) * 100);

  // update progress
  const existing = db.data.progress.find(p => p.userId === req.user.id && p.moduleId === moduleId);
  const now = new Date().toISOString();
  if (existing) {
    existing.lastAttempt = now;
    existing.bestScore = Math.max(existing.bestScore, score);
  } else {
    db.data.progress.push({ id: `prog_${nanoid(8)}`, userId: req.user.id, moduleId, bestScore: score, lastAttempt: now });
  }

  // record analytics
  db.data.analytics.push({
    id: `evt_${nanoid(8)}`,
    userId: req.user.id,
    event: 'module_attempt',
    moduleId,
    score,
    timestamp: now
  });

  await db.write();
  res.json({ score, correct, total: mod.quiz.length });
});

app.get('/api/progress', authMiddleware, async (req, res) => {
  await db.read();
  const userProg = db.data.progress.filter(p => p.userId === req.user.id);
  res.json(userProg);
});

// simple admin endpoint to list analytics (no auth for demo; add proper admin auth in production)
app.get('/api/analytics', async (req, res) => {
  await db.read();
  res.json(db.data.analytics);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Mindra server running on http://localhost:${PORT}`));
