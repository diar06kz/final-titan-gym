const nodemailer = require("nodemailer");
const { env } = require("../config/env");

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      secure: Number(env.MAIL_PORT) === 465,
      auth: { user: env.MAIL_USER, pass: env.MAIL_PASS },
    });
  }
  return transporter;
}

async function sendWelcomeEmail(to, name) {
  if (!env.ENABLE_EMAIL) return;

  const tr = getTransporter();
  await tr.sendMail({
    from: env.MAIL_FROM,
    to,
    subject: "Welcome to Bloom GYM",
    text: `Hi${name ? " " + name : ""}, welcome! Your account has been created successfully.`,
  });
}

module.exports = { sendWelcomeEmail };
