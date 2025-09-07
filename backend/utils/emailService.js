// utils/emailService.js
const nodemailer = require("nodemailer");

// Lazy, cached transporter to allow fallbacks when env creds are missing
let cachedTransporterPromise = null;

async function getTransporter() {
  if (cachedTransporterPromise) return cachedTransporterPromise;

  cachedTransporterPromise = (async () => {
    const hasCreds = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

    if (hasCreds) {
      // Use configured SMTP (e.g., Gmail/App Password, Mailtrap, etc.)
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
        secure: String(process.env.EMAIL_SECURE || "false").toLowerCase() === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }

    // Fallback to Ethereal test account for development when creds are missing
    const testAccount = await nodemailer.createTestAccount();
    const transport = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log("⚠️ EMAIL_USER/EMAIL_PASS not set. Using Ethereal test SMTP.");
    console.log(`   Ethereal inbox: https://ethereal.email/login (user: ${testAccount.user})`);

    return transport;
  })();

  return cachedTransporterPromise;
}

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} [html] - Optional HTML content
 */
async function sendEmail(to, subject, text, html) {
  try {
    const transporter = await getTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@ecofinds.dev",
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    const preview = nodemailer.getTestMessageUrl(info);
    console.log(`📧 Email sent: ${info.messageId}`);
    if (preview) console.log(`🔍 Preview: ${preview}`);
    return { info, previewUrl: preview };
  } catch (error) {
    // Improve error clarity for missing credentials
    if (error && (error.code === "EAUTH" || /Missing credentials/i.test(error.message))) {
      throw new Error(
        "Email sending failed: missing SMTP credentials. Set EMAIL_USER and EMAIL_PASS or rely on Ethereal in development."
      );
    }
    console.error("❌ Error sending email:", error);
    throw new Error("Email sending failed");
  }
}

module.exports = sendEmail;
