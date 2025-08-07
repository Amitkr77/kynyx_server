const transporter = require("../config/mail.config");

const sendQuoteEmail = async ({ name, email, phone, service, budget, timeline, description }) => {
  const mailOptions = {
    from: process.env.NO_REPLY_EMAIL,
    to: process.env.COMPANY_EMAIL,
    subject: `New Quote Request from - ${name}`,
    html: `
      <h3>Quote Details</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not Provided'}</p>
      <p><strong>Service:</strong> ${service}</p>
      <p><strong>Budget:</strong> ${budget}</p>
      <p><strong>Timeline:</strong> ${timeline}</p>
      <p><strong>Description:</strong> ${description}</p>
    `,
    replyTo: email,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendQuoteEmail;
