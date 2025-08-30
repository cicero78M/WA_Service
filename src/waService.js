import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const waClient = new Client({
  authStrategy: new LocalAuth({ clientId: process.env.APP_SESSION_NAME || 'wa-service' }),
  puppeteer: {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  }
});

waClient.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log('[WA] QR code generated, scan please.');
});

waClient.on('ready', () => {
  console.log('[WA] Client is ready');
});

waClient.on('message', async msg => {
  try {
    const backend = process.env.BACKEND_URL;
    if (!backend) return;
    const payload = { from: msg.from, body: msg.body, timestamp: msg.timestamp };
    const { data } = await axios.post(`${backend}/wa/incoming`, payload);
    const replies = data?.replies || [];
    for (const r of replies) {
      const text = typeof r === 'string' ? r : r.message;
      if (text) await waClient.sendMessage(msg.from, text);
    }
  } catch (err) {
    console.error('[WA] Error forwarding message:', err.message);
  }
});

waClient.initialize();

export { waClient };
