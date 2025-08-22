require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');

const {
  CLIENT_ID,
  CLIENT_SECRET,
  DRIVE_REFRESH_TOKEN: REFRESH_TOKEN,
  FOLDER_ID: PARENT_FOLDER_ID,
} = process.env;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !PARENT_FOLDER_ID) {
  throw new Error('Missing required environment variables: CLIENT_ID, CLIENT_SECRET, DRIVE_REFRESH_TOKEN, FOLDER_ID');
}

const TOKEN_URL = 'https://accounts.zoho.in/oauth/v2/token';
const UPLOAD_URL_BASE = 'https://www.zohoapis.in/workdrive/api/v1/upload';

/**
 * Get a new access token using refresh token
 */
async function getAccessToken(retries = 1) {
  try {
    const response = await axios.post(TOKEN_URL, null, {
      params: {
        refresh_token: REFRESH_TOKEN,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token',
      },
    });

    return response.data.access_token;
  } catch (error) {
    if (retries > 0) {
      console.warn('🔁 Retrying access token fetch...');
      return getAccessToken(retries - 1);
    }
    throw new Error(`Unable to retrieve access token: ${error.response?.data?.error_description || error.message}`);
  }
}

/**
 * Uploads a file buffer to Zoho WorkDrive and returns the permalink
 * @param {Buffer} buffer - File content buffer
 * @param {string} fileName - File name including extension
 * @param {string} mimeType - MIME type, default is application/pdf
 * @returns {Promise<string>} - The Zoho WorkDrive permalink of the uploaded file
 */
async function uploadPDFBuffer(buffer, fileName, mimeType = 'application/pdf') {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error('Invalid or empty buffer provided.');
  }

  const accessToken = await getAccessToken();
  const url = `${UPLOAD_URL_BASE}?parent_id=${PARENT_FOLDER_ID}`;

  const form = new FormData();

  const uniqueFileName = `${Date.now()}_${fileName}`;
  form.append('content', buffer, {
    filename: uniqueFileName,
    contentType: mimeType,
  });

  try {
    const response = await axios.post(url, form, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        ...form.getHeaders(),
      },
      maxBodyLength: Infinity,
    });

    const data = response.data;

    if (!data || !data.data || !data.data.length || !data.data[0].attributes?.Permalink) {
      throw new Error('Unexpected API response format from Zoho WorkDrive.');
    }

    const permalink = data.data[0].attributes.Permalink;
    // console.log('✅ Uploaded to Zoho WorkDrive:', permalink);

    return permalink;
  } catch (error) {
    const errData = error.response?.data || error.message;
    console.error('❌ Error uploading to Zoho WorkDrive:', errData);
    throw new Error(`Zoho WorkDrive upload failed: ${JSON.stringify(errData)}`);
  }
}

module.exports = uploadPDFBuffer;
