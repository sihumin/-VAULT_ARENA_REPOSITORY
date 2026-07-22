import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = 4174;
// Explicitly binding to 127.0.0.1 to reject external tests per requirement
const HOST = '127.0.0.1';

app.use(cors());
app.use(express.json());

app.get('/api/logs', (req, res) => {
  try {
    const logPath = path.join(process.cwd(), 'reports', 'events.jsonl');
    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, 'utf-8');
      const logs = content.split('\n').filter(Boolean).map(line => JSON.parse(line));
      res.json(logs);
    } else {
      res.json([]);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to read logs' });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`VaultArena Local Control Server strictly running at http://${HOST}:${PORT}`);
});
