const sendMail = require("../services/contactMail.service");
const sanitizeInput = require("../utils/sanitize");
const addToZohoSheet = require("../services/saveContactToGoogleSheet");

const handleContact = async (req, res, next) => {
  try {
    const { name, email, service, message, phone, company } = req.body;

    const sanitized = {
  NAME: sanitizeInput(name),
  EMAIL: sanitizeInput(email),
  SERVICE: sanitizeInput(service),
  COMPANY: sanitizeInput(company),
  MESSAGE: sanitizeInput(message),
  PHONE: phone ? sanitizeInput(phone) : "Not provided",
};
    await sendMail(sanitized);
    await addToZohoSheet(sanitized);

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    next(error);
  }
};

module.exports = handleContact;