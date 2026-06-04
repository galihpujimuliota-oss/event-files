import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html } = req.body;
  
  if (!to) {
    return res.status(400).json({ error: 'Missing recipient email' });
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[SIMULATED MAIL - VERCEL] TO: ${to}`);
    // Respond successfully so the frontend doesn't break, but log that it was mocked
    return res.status(200).json({ success: true, simulated: true });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 5000, // 5 seconds
      greetingTimeout: 4000,   // 4 seconds
      socketTimeout: 5000      // 5 seconds
    });

    const info = await transporter.sendMail({
      from: `"Sistem Registrasi Yudisium" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Email error:', error);
    let errorMessage = error?.message || 'Failed to send email';
    if (errorMessage.includes('535') || errorMessage.includes('Username and Password not accepted') || errorMessage.includes('Invalid login')) {
      errorMessage = "Gagal login ke SMTP Server (Error 535). Jika menggunakan Gmail, Anda HARUS menggunakan 'Sandi Aplikasi' (App Password) berisi 16 karakter tanpa spasi dari Akun Google Anda, BUKAN kata sandi login biasa. Silakan buka Akun Google Anda -> Keamanan -> Aktifkan Verifikasi 2 Langkah -> Cari menu 'Sandi Aplikasi' (App Password) dan buat sandi khusus untuk aplikasi ini.";
    }
    return res.status(500).json({ error: errorMessage });
  }
}
