const sanitize = require("../utils/sanitize");
const uploadPDFBuffer = require("../utils/uploadResumeToDrive");
const addToZohoSheet = require("../services/saveQuoteToGoogleSheet");
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
      fileUrl = await uploadPDFBuffer(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        // process.env.GOOGLE_DRIVE_FOLDER_ID
      );
    }

    await sendEmail({ ...data, fileUrl });
    await addToZohoSheet({ ...data, fileUrl });

    res.status(200).json({ message: "Consultation request submitted successfully!" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = handleBookConsultation;
