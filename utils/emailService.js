const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (email, otp) => {
  try {
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev', // works without domain setup
      to: email,
      subject: 'OTP Verification',
      html: `<h2>Your OTP is: ${otp}</h2>`
    });

    console.log("✅ Email sent:", response);

  } catch (error) {
    console.error("❌ Email error:", error);
  }
};

module.exports = { sendOTPEmail };