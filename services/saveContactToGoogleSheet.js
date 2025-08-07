const { google } = require("googleapis");
const credentials = require("../config/google-credentials.json");

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const saveToGoogleSheet = async ({ name, email, service, message, phone, company }) => {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = process.env.CONTACT_SHEET_ID;
  const sheetName = "Submissions";

  // Check if headers are present
  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:E1`,
  });

  const isEmpty = !readRes.data.values || readRes.data.values.length === 0;

  // If empty, insert column headers
  if (isEmpty) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:G1`,
      valueInputOption: "RAW",
      resource: {
        values: [["NAME", "EMAIL", "PHONE", "COMPANY", "SERVICE OPTED", "DESCRPTION", "DATE"]],
      },
    });

    // Apply bold formatting to header row
    const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetId = sheetMeta.data.sheets.find(s => s.properties.title === sheetName)?.properties.sheetId;

    if (sheetId !== undefined) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: 7,
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: {
                      bold: true,
                    },
                    backgroundColor: {
                      red: 0.98,
                      green: 0.76,
                      blue: 0.09,
                    },
                  },
                },
                fields: "userEnteredFormat(textFormat, backgroundColor)",
              },
            },
          ],
        },
      });
    }
  }

  // Append new row
  const now = new Date().toLocaleString("en-IN", {
   timeZone: "Asia/Kolkata",
  });
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:F`,
    valueInputOption: "RAW",
    resource: {
      values: [[name, email, phone, company, service, message, now]],
    },
  });
};

module.exports = saveToGoogleSheet;
