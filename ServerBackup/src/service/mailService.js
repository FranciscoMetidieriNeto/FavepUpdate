const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // CORRIGIDO
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, // MELHORADO
    pass: process.env.EMAIL_PASS  // MELHORADO
  }
});

async function sendVerificationEmail(to, token) {
  const verificationLink = `${process.env.API_BASE_URL}/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Favep" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Confirmação de E-mail - Favep',
    // MELHORADO: HTML mais robusto
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
        <h2>Bem-vindo à Favep!</h2>
        <p>Obrigado por se registrar. Por favor, clique no botão abaixo para confirmar seu e-mail e definir sua senha.</p>
        <a href="${verificationLink}" style="background-color: #28a745; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Confirmar E-mail</a>
        <p style="font-size: 0.9em; color: #777;">Se você não se registrou, por favor, ignore este e-mail.</p>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
}

async function sendPasswordResetEmail(to, token) {
  const resetLink = `${process.env.API_BASE_URL}/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Favep" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Redefinição de Senha - Favep',
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
        <h2>Redefinição de Senha</h2>
        <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova.</p>
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Redefinir Senha</a>
        <p style="font-size: 0.9em; color: #777;">Se você não fez esta solicitação, pode ignorar este e-mail com segurança.</p>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };