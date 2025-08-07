const sanitize = require("../utils/sanitize");
const uploadToDrive = require("../utils/uploadQuoteFileToDrive");
const saveToSheet = require("../services/saveQuoteToGoogleSheet");
const sendEmail = require("../services/quoteMail.service"); 

const handleBookConsultation = async (req, res, next) => {
  try {
    const fields = [
      "name", "email", "phone", "company", "website",
      "services", "otherService", "projectDetails",
      "budget"
    ];

    const data = {};
    fields.forEach(field => {
      data[field] = sanitize(req.body[field] || "");
    });

    // Convert array services to comma-separated string
    if (Array.isArray(data.services)) {
      data.services = data.services.join(", ");
    }

    // Upload file to Google Drive
    let fileUrl = "";
    if (req.file) {
      const uploadedFile = await uploadToDrive(req.file);
      fileUrl = uploadedFile.webViewLink;
    }

    await sendEmail({ ...data, fileUrl });
    await saveToSheet({ ...data, fileUrl });

    res.status(200).json({ message: "Consultation request submitted successfully!" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = handleBookConsultation;
