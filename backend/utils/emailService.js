const nodemailer = require('nodemailer');

// Create reusable transporter
let transporter;

// Initialize the email transporter
const initializeTransporter = () => {
  if (transporter) return;

  // For production
  if (process.env.NODE_ENV === 'production') {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // For development - use ethereal.email
    nodemailer.createTestAccount().then(testAccount => {
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('Test email account created:', testAccount.user);
    });
  }
};

// Send email function
exports.sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    initializeTransporter();
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Learning Platform'}" <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
      to,
      subject,
      text,
      html
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('Email sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Initialize on module load
initializeTransporter(); 