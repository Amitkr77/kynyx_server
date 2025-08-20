const sendMail = require("../services/contactMail.service");
const sanitizeInput = require("../utils/sanitize");
const addToZohoSheet = require("../services/saveContactToGoogleSheet");

const handleContact = async (req, res, next) => {
  try {
    const { name, email, service, message, phone, company } = req.body;

    const sanitized = {
  Name: sanitizeInput(name),
  Email: sanitizeInput(email),
  Service: sanitizeInput(service),
  Company: sanitizeInput(company),
  Message: sanitizeInput(message),
  Phone: phone ? sanitizeInput(phone) : "Not provided",
};
    await sendMail(sanitized);
    await addToZohoSheet(sanitized);

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    next(error);
  }
};

module.exports = handleContact;