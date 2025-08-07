const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

// Decode the base64-encoded credentials from the environment variable
const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;

if (!credentialsBase64) {
  console.error("GOOGLE_CREDENTIALS_BASE64 environment variable is not set");
  process.exit(1);
}

// Decode the credentials from base64 to JSON
const credentials = JSON.parse(Buffer.from(credentialsBase64, "base64").toString("utf-8"));

// Create the GoogleAuth instance using the decoded credentials
const auth = new google.auth.GoogleAuth({
  credentials,
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

  try {
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
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error);
    throw error;
  }
};

module.exports = uploadToDrive;
