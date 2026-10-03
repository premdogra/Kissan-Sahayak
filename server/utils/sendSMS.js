const axios = require("axios");

const sendSMS = async (mobile, otp) => {
  try {

    const response = await axios.get(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        params: {
          authorization: process.env.FAST2SMS_API_KEY,
          route: "otp",
          variables_values: otp,
          numbers: mobile
        }
      }
    );

    return response.data;

  } catch (error) {
    console.error("SMS sending failed:", error.response?.data || error.message);
  }
};

module.exports = sendSMS;