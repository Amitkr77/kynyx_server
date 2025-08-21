const transporter = require("../config/mail.config");

const sendCareerEmail = async (application) => {
  const mailOptions = {
    from: `Kynyx Job Applications  <noreply@kynyx.com>`,
    to: process.env.TO_EMAIL,
    subject: `Job Application for: ${application.POSITION}`,
    html: `
      <h3>Contact Applicant Details</h3>
      <p><strong>Name:</strong> ${application.NAME}</p>
      <p><strong>Email:</strong> ${application.EMAIL}</p>
      <p><strong>Phone:</strong> ${application.PHONE}</p>
      <p><strong>Position applied for:</strong><br>${application.POSITION}</p>
      <p><strong>Github Profile:</strong><br>${application.GITHUB || ""}</p>
      <p><strong>LinkedIn profile:</strong><br>${application.LINKEDIN || ""}</p>
      <p><strong>Portfolio:</strong><br>${application.PORTFOLIO || ""}</p>
      <p><strong>How did you hear about us:</strong><br>${application.REFERRAL}</p>
      <p><strong>Resume link:</strong><br>${application.RESUME_LINK}</p>
    `,
    replyTo: application.EMAIL,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendCareerEmail;
