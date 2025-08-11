const { google } = require("googleapis");
const stream = require("stream");

const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;

if (!credentialsBase64) {
  console.error("GOOGLE_CREDENTIALS_BASE64 environment variable is not set -- resume");
  process.exit(1);
}

const credentials = JSON.parse(Buffer.from(credentialsBase64, "base64").toString("utf-8"));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const uploadToDrive = async (fileBuffer, fileName, mimeType, folderId) => {
  const client = await auth.getClient();
  const drive = google.drive({ version: "v3", auth: client });

  // Convert buffer to a readable stream
  const bufferStream = new stream.PassThrough();
  bufferStream.end(fileBuffer);

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  const media = {
    mimeType,
    body: bufferStream,
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id, webViewLink",
  });

  return response.data.webViewLink;
};

module.exports = uploadToDrive;
