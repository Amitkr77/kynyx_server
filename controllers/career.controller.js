const uploadToDrive = require("../utils/uploadResumeToDrive");
const sendCareerEmail = require("../services/careerMail.service");
const saveCareerToSheet = require("../services/saveCareerToGoogleSheet");

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
      resumeLink = await uploadToDrive(
        req.file.path,
        req.file.originalname,
        req.file.mimetype,
        process.env.GOOGLE_DRIVE_FOLDER_ID
      );
    }

    const application = {
      name,
      email,
      phone,
      position,
      github,
      linkedIn,
      portfolio,
      referral,
      resumeLink,
    };

    await sendCareerEmail(application);
    await saveCareerToSheet(application);

    res.status(200).json({ message: "Application submitted!" });
  } catch (error) {
    next(error);
  }
};

module.exports = handleCareer;
