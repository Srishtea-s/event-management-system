const nodemailer = require('nodemailer');

let transporter;

// 🔥 Create test account automatically
const createTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  console.log("✅ Ethereal Email Ready");
};

createTransporter();

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: '"EventHub" <test@ethereal.email>',
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`
    });

    console.log("✅ Email sent (Ethereal)");
    console.log("📩 Preview URL:", nodemailer.getTestMessageUrl(info));

  } catch (error) {
    console.log("❌ Email error:", error);
  }
};

module.exports = { sendOTPEmail };