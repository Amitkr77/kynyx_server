const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../config/google-credentials.json"),
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

const uploadToDrive = async (file) => {
  const folderId = process.env.QUOTE_FILE_DRIVE_ID;

  const fileMetadata = {
    name: file.originalname,
    parents: [folderId],
  };

  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path),
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: "id, webViewLink",
  });

  // Make file public
  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  return response.data;
};

module.exports = uploadToDrive;
