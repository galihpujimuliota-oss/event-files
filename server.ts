import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Simple file-based db to persist across nodemon restarts in dev
const DB_FILE = path.join(process.cwd(), 'db.json');
let memoryDb: any = {};

try {
  if (fs.existsSync(DB_FILE)) {
    memoryDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  }
} catch (e) {
  memoryDb = {};
}

const saveDb = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2));
  } catch (e) {
    console.error('Failed to save DB', e);
  }
};

// API: Get all attendees
app.get('/api/attendees', (req, res) => {
  res.json(memoryDb);
});

// API: Upsert attendee
app.post('/api/attendees', (req, res) => {
  const data = req.body;
  if (!data?.id) {
    return res.status(400).json({ error: 'Missing ID' });
  }
  memoryDb[data.id] = { ...memoryDb[data.id], ...data };
  saveDb();
  res.json(memoryDb[data.id]);
});

// API: Delete attendee
app.delete('/api/attendees/:id', (req, res) => {
  const { id } = req.params;
  if (memoryDb[id]) {
    delete memoryDb[id];
    saveDb();
  }
  res.json({ success: true });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Please note: Note the Express version of the app. In Express v5, you must use app.get('*all',
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
