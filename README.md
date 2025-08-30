# WA Service

Service ini menangani komunikasi WhatsApp dan terpisah dari backend utama.

## Menjalankan

1. Instal dependensi:
   ```bash
   npm install
   ```
2. Salin `.env.example` menjadi `.env` dan atur variabel berikut:
   - `APP_SESSION_NAME` – nama folder sesi WhatsApp
   - `BACKEND_URL` – URL backend yang akan menerima pesan
   - `ADMIN_WHATSAPP` – daftar id chat default untuk broadcast (dipisah koma)
   - `WA_PORT` – port server WA (opsional, default 3001)
3. Jalankan service:
   ```bash
   npm start
   ```

## Endpoint

- `POST /send` – kirim pesan WA ke nomor tertentu
- `POST /broadcast` – kirim pesan ke banyak nomor atau `ADMIN_WHATSAPP`

## Pengujian

Menjalankan tes sederhana:
```bash
npm test
```

