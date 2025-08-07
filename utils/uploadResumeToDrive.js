const fs = require("fs");
const { google } = require("googleapis");
const path = require("path");

// Decode the base64-encoded credentials from the environment variable
const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;

if (!credentialsBase64) {
  console.error("GOOGLE_CREDENTIALS_BASE64 environment variable is not set");
  process.exit(1);
}

// Decode the credentials from base64 to JSON
const credentials = JSON.parse(Buffer.from(credentialsBase64, "base64").toString("utf-8"));
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
