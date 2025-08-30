import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { waClient } from './waService.js';

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
    await waClient.sendMessage(to, message, options);
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
    await Promise.all(targets.map(id => waClient.sendMessage(id, message)));
    res.json({ success: true, sent: targets.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = process.env.WA_PORT || 3001;
app.listen(PORT, () => console.log(`WA service running on port ${PORT}`));
