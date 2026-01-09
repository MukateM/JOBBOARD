const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"ZedLink Careers" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

module.exports = { sendEmail };