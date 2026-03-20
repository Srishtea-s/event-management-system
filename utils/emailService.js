const axios = require("axios");

const sendOTPEmail = async (email, otp) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "EventHub",
          email: "your_email@gmail.com" // 👈 use your Gmail here
        },
        to: [
          {
            email: email
          }
        ],
        subject: "OTP Verification",
        htmlContent: `
          <h2>Your OTP is:</h2>
          <h1>${otp}</h1>
          <p>Valid for 10 minutes</p>
        `
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
    console.error("❌ Email error:", error.response?.data || error.message);
  }
};

module.exports = { sendOTPEmail };