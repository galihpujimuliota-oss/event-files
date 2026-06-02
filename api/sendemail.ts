import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    });

    const info = await transporter.sendMail({
      from: `"Sistem Registrasi Yudisium" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
