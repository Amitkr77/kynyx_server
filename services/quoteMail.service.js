const transporter = require("../config/mail.config");

const sendQuoteEmail = async (data) => {
  const mailOptions = {
    from: process.env.NO_REPLY_EMAIL,
    to: process.env.COMPANY_EMAIL,
    subject: `New Quote Request from - ${data.name}`,
    html: `
      <h3>Quote Details</h3>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone || 'Not Provided'}</p>
      <p><strong>Company name:</strong> ${data.company}</p>
      <p><strong>Website:</strong> ${data.website}</p>
      <p><strong>Service:</strong> ${data.services}</p>
      <p><strong>Other service:</strong> ${data.otherServices || ""}</p>
      <p><strong>project details:</strong> ${data.projectDetails || ""}</p>
      <p><strong>Budget:</strong> ${data.budget}</p>
      <p><strong>Reference file:</strong> ${data.fileUrl || ""}</p>
      
    `,
    replyTo: data.email,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendQuoteEmail;
