/**
 * backend/src/index.js
 * ─────────────────────────────────────────────────────────────
 * Express API for saving and loading furniture configurations.
 *
 * Routes:
 *   POST /api/configs       → save config, returns { id }
 *   GET  /api/configs/:id   → load config by id
 *   GET  /api/configs       → list all saved configs
 *
 * Storage: in-memory Map (swap with MongoDB for production)
 */
import express from 'express';
import cors    from 'cors';
import { nanoid } from 'nanoid';

const app  = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = (process.env.CLIENT_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// ── In-memory store ───────────────────────────────────────────
// Key: id (string), Value: { config, createdAt }
const store = new Map();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
}));
app.use(express.json());

// Request logger (dev only)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────

/**
 * POST /api/configs
 * Body: { dims: { W, H, D, T }, material: string }
 * Returns: { id, shareUrl }
 */
app.post('/api/configs', (req, res) => {
  const config = req.body;

  // Basic validation
  if (!config?.dims || !config?.material) {
    return res.status(400).json({ error: 'Invalid config payload' });
  }

  const id = nanoid(10); // e.g. "V1StGXR8_Z"
  store.set(id, {
    config,
    createdAt: new Date().toISOString(),
  });

  console.log(`[Config] Saved: ${id}`);
  res.status(201).json({ id });
});

/**
 * GET /api/configs/:id
 * Returns the saved config or 404
 */
app.get('/api/configs/:id', (req, res) => {
  const entry = store.get(req.params.id);
  if (!entry) {
    return res.status(404).json({ error: 'Config not found' });
  }
  res.json(entry.config);
});

/**
 * GET /api/configs
 * Lists all saved config IDs (useful for admin/debug)
 */
app.get('/api/configs', (_req, res) => {
  const list = Array.from(store.entries()).map(([id, entry]) => ({
    id,
    material:  entry.config.material,
    createdAt: entry.createdAt,
  }));
  res.json(list);
});

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', configs: store.size }));

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 FurniCraft API running at http://localhost:${PORT}`);
  console.log(`   POST /api/configs   → save config`);
  console.log(`   GET  /api/configs/:id → load config\n`);
});
