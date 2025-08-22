require('dotenv').config();
const axios = require('axios');

// --- Load environment variables ---
const {
  CLIENT_ID,
  CLIENT_SECRET,
  REFRESH_TOKEN,
  SHEET_ID: SPREADSHEET_ID,
  CONTACT_WORKSHEET_NAME,
} = process.env;

const tokenUrl = 'https://accounts.zoho.in/oauth/v2/token';

/**
 * Get a Zoho access token using the refresh token
 */
async function getAccessToken() {
  const response = await axios.post(tokenUrl, null, {
    params: {
      refresh_token: REFRESH_TOKEN,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
    },
  });

  return response.data.access_token;
}

/**
 * Appends form data to the Zoho Sheet
 * @param {Object} formData
 */
async function addToZohoSheet(formData) {
  const accessToken = await getAccessToken();

  const url = `https://sheet.zoho.in/api/v2/${SPREADSHEET_ID}?method=worksheet.records.add&worksheet_name=${CONTACT_WORKSHEET_NAME}`;
 
  const istTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: false, 
  });

  const dataWithTimestamp = {
    ...formData,
    submitted_at: istTime, // Make sure your Zoho Sheet has a "submitted_at" column
  };

  const payload = new URLSearchParams({
    json_data: JSON.stringify([dataWithTimestamp]),
  });

  const config = {
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  const response = await axios.post(url, payload, config);

  if (response.data?.status !== 'success') {
    throw new Error('Zoho Sheet insert failed.');
  }

}

module.exports = addToZohoSheet ;
