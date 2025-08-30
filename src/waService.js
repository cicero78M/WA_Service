import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

let waClient;

export async function initWA() {
  if (waClient) return waClient;

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: process.env.APP_SESSION_NAME || 'wa-service' }),
    restartOnAuthFail: true,
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
  });

  client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('[WA] QR code generated, scan please.');
  });

  client.on('authenticated', () => console.log('[WA] Authenticated'));

  client.on('auth_failure', msg => {
    console.error('[WA] AUTH FAILURE', msg);
  });

  client.on('ready', () => {
    console.log('[WA] Client is ready');
  });

  client.on('disconnected', reason => {
    console.log('[WA] Disconnected:', reason);
  });

  client.on('message', async msg => {
    try {
      const backend = process.env.BACKEND_URL;
      if (!backend) return;
      const payload = { from: msg.from, body: msg.body, timestamp: msg.timestamp };
      const { data } = await axios.post(`${backend}/wa/incoming`, payload);
      const replies = data?.replies || [];
      for (const r of replies) {
        const text = typeof r === 'string' ? r : r.message;
        if (text) await client.sendMessage(msg.from, text);
      }
    } catch (err) {
      console.error('[WA] Error forwarding message:', err.message);
    }
  });

  await client.initialize();
  waClient = client;

  process.once('SIGINT', async () => {
    try {
      await waClient.destroy();
    } finally {
      process.exit(0);
    }
  });

  return waClient;
}

export function getClient() {
  if (!waClient) {
    throw new Error('WhatsApp client not initialized. Call initWA() first.');
  }
  return waClient;
}
