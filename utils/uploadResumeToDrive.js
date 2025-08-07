const fs = require("fs");
const { google } = require("googleapis");
const path = require("path");

const credentials = require("../config/google-credentials.json");

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const uploadToDrive = async (filePath, fileName, mimeType, folderId) => {
  const client = await auth.getClient();
  const drive = google.drive({ version: "v3", auth: client });

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  const media = {
    mimeType,
    body: fs.createReadStream(filePath),
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: "id, webViewLink",
  });

  // Optionally delete temp file
  fs.unlinkSync(filePath);

  return response.data.webViewLink;
};

module.exports = uploadToDrive;
