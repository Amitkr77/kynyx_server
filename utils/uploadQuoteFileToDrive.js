const { google } = require("googleapis");
const { PassThrough } = require("stream");

// Decode credentials from env
const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;

if (!credentialsBase64) {
  console.error("GOOGLE_CREDENTIALS_BASE64 environment variable is not set - quote file");
  process.exit(1);
}

const credentials = JSON.parse(Buffer.from(credentialsBase64, "base64").toString("utf-8"));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

const uploadToDrive = async (file) => {
  const folderId = process.env.QUOTE_FILE_DRIVE_ID;

  // Convert file buffer to stream
  const bufferStream = new PassThrough();
  bufferStream.end(file.buffer);

  const fileMetadata = {
    name: file.originalname,
    parents: [folderId],
  };

  const media = {
    mimeType: file.mimetype,
    body: bufferStream,
  };

  try {
    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id, webViewLink",
    });

    // Make file public
    // await drive.permissions.create({
    //   fileId: response.data.id,
    //   requestBody: { role: "reader", type: "anyone" },
    // });

    return response.data;
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error);
    throw error;
  }
};

module.exports = uploadToDrive;
