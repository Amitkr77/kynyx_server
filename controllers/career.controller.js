const uploadPDFBuffer = require("../utils/uploadResumeToDrive");
const sendCareerEmail = require("../services/careerMail.service");
const addToZohoSheet = require("../services/saveCareerToGoogleSheet");

const handleCareer = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      position,
      github,
      linkedIn,
      portfolio,
      referral,
    } = req.body;

    let resumeLink = "";
    if (req.file) {
      resumeLink = await uploadPDFBuffer(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        // process.env.GOOGLE_DRIVE_FOLDER_ID
      );
    }
  
    const formattedData = {
      NAME: name || "",
      EMAIL: email || "",
      PHONE: phone || "",
      POSITION: position || "",
      GITHUB: github || "",
      LINKEDIN: linkedIn || "",
      PORTFOLIO: portfolio || "",
      REFERRAL: referral || "",
      RESUME_LINK: resumeLink || "",
};



    await sendCareerEmail(formattedData);
    await addToZohoSheet(formattedData);

    res.status(200).json({ message: "Application submitted!" });
  } catch (error) {
    next(error);
  }
};

module.exports = handleCareer;
