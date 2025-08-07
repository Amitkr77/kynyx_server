const sendQuoteEmail = require("../services/quoteMail.service");
const saveQuoteToGoogleSheet = require("../services/saveQuoteToGoogleSheet");
const sanitize = require("../utils/sanitize");

const handleQuote = async (req, res, next) => {
  try {
    const data = {};
    ["name", "email", "phone", "service", "budget", "timeline", "description"].forEach(field => {
      data[field] = sanitize(req.body[field] || '');
    });

    await sendQuoteEmail(data);
    await saveQuoteToGoogleSheet(data);
    res.status(200).json({ message: "Quote sent successfully!" });
  } catch (error) {
    next(error);
  }
};

module.exports = handleQuote;
