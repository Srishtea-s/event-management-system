const axios = require("axios");

const sendOTPEmail = async (email, otp) => {
  try {
    console.log("📧 Sending OTP to:", email);

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "EventHub",
          email: "noreply@brevo.com" // ✅ IMPORTANT (trusted sender)
        },
        to: [
          {
            email: email
          }
        ],
        subject: "OTP Verification - EventHub",

        htmlContent: `
          <div style="font-family: Arial, sans-serif; text-align: center;">
            <h2>🎯 EventHub Verification</h2>
            <p>Your OTP is:</p>
            <h1 style="color: #e67e22;">${otp}</h1>
            <p>This OTP is valid for 10 minutes.</p>
          </div>
        `,

        textContent: `Your OTP is ${otp}` // ✅ VERY IMPORTANT
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Email sent via Brevo:", response.data);

  } catch (error) {
    console.error(
      "❌ Email sending failed:",
      error.response?.data || error.message
    );
  }
};

module.exports = { sendOTPEmail };