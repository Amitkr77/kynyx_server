const transporter = require("../config/mail.config");

const sendCareerEmail = async (application) => {
  const mailOptions = {
    from: `Kynyx Job Applications - <no-reply@homeasy.io>`,
    to: process.env.COMPANY_EMAIL,
    subject: `Job Application for: ${application.position}`,
    html: `
      <h3>Contact Applicant Details</h3>
      <p><strong>Name:</strong> ${application.name}</p>
      <p><strong>Email:</strong> ${application.email}</p>
      <p><strong>Phone:</strong> ${application.phone}</p>
      <p><strong>Position applied for:</strong><br>${application.position}</p>
      <p><strong>Github Profile:</strong><br>${application.github || ""}</p>
      <p><strong>LinkedIn profile:</strong><br>${application.linkedIn || ""}</p>
      <p><strong>Portfolio:</strong><br>${application.portfolio || ""}</p>
      <p><strong>How did you hear about us:</strong><br>${application.referral}</p>
      <p><strong>Resume link:</strong><br>${application.resumelink}</p>
    `,
    replyTo: application.email,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendCareerEmail;
