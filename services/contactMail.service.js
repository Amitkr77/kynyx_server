const transporter = require("../config/mail.config");

const sendContactEmail = async (data) => {
  const mailOptions = {
    from: `Kynyx Contact Form  <noreply@kynyx.com>`,
    to: process.env.TO_EMAIL,
    subject: `Contact Request: ${data.SERVICE}`,
    html: `
      <h3>Contact Form Submission</h3>
      <p><strong>Name:</strong> ${data.NAME}</p>
      <p><strong>Email:</strong> ${data.EMAIL}</p>
      <p><strong>Phone:</strong> ${data.PHONE}</p>
      <p><strong>Company:</strong> ${data.COMPANY}</p>
      <p><strong>Service:</strong> ${data.SERVICE}</p>
      <p><strong>Message:</strong><br>${data.MESSAGE}</p>
    `,
    replyTo: data.EMAIL,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendContactEmail;
