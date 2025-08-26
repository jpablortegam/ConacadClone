// lib/mail.ts
import 'server-only';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST!,
  port: Number(process.env.EMAIL_SERVER_PORT || 465),
  secure: true, // Gmail 465 => SSL
  auth: {
    user: process.env.EMAIL_SERVER_USER!,
    pass: process.env.EMAIL_SERVER_PASSWORD!,
  },
});

export async function sendLinkNoticeEmail({
  to,
  userName,
  provider,
  unlinkUrl,
}: {
  to: string;
  userName: string;
  provider: string;
  unlinkUrl: string;
}) {
  const html = `
    <p>Hola ${userName},</p>
    <p>Se acaba de <strong>vincular</strong> un proveedor <b>${provider}</b> a tu cuenta.</p>
    <p>Si <u>no fuiste tú</u>, puedes <a href="${unlinkUrl}">desvincular ahora</a>.</p>
    <p>Si reconoces esta acción, ignora este correo.</p>
    <hr/><small>Este enlace vence en 30 minutos.</small>
  `;
  return transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    to,
    subject: `Se vinculó ${provider} a tu cuenta`,
    html,
  });
}
