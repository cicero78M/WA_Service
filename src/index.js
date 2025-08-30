import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initWA, getClient } from './waService.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/send', async (req, res) => {
  const { to, message, options } = req.body || {};
  if (!to || !message) {
    return res.status(400).json({ success: false, message: 'to and message required' });
  }
  try {
    const client = getClient();
    await client.sendMessage(to, message, options);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/broadcast', async (req, res) => {
  const { message, chatIds } = req.body || {};
  const targets = chatIds || (process.env.ADMIN_WHATSAPP ? process.env.ADMIN_WHATSAPP.split(',') : []);
  if (!message) {
    return res.status(400).json({ success: false, message: 'message required' });
  }
  try {
    const client = getClient();
    await Promise.all(targets.map(id => client.sendMessage(id, message)));
    res.json({ success: true, sent: targets.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = process.env.WA_PORT || 3001;

initWA()
  .then(() => {
    app.listen(PORT, () => console.log(`WA service running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Failed to initialize WhatsApp client:', err);
    process.exit(1);
  });
