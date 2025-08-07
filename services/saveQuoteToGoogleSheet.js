const { google } = require("googleapis");
const credentials = require("../config/google-credentials.json");

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const SHEET_ID = process.env.QUOTE_SHEET_ID;

const saveQuoteToGoogleSheet = async (data) => {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const headerValues = [
    ["NAME", "EMAIL", "PHONE", "SERVICES", "BUDGET", "TIMELINE", "DESCRIPTION", "DATE CREATED"],
  ];

  const userRow = [
    data.name,
    data.email,
    data.phone || "",
    data.service,
    data.budget,
    data.timeline,
    data.description,
    new Date().toISOString(),
  ];

  // First, get existing values to check if header exists
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Quotes!A1:H1",
  });

  if (!existing.data.values || existing.data.values.length === 0) {
    // Insert headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: "Quotes!A1:H1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: headerValues,
      },
    });

    // Apply bold and background formatting to header
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0, // assumes first sheet
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 8,
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

  // Append new row
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Quotes!A:H",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [userRow],
    },
  });
};

module.exports = saveQuoteToGoogleSheet;
