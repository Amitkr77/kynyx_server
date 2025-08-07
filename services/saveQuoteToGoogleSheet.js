const { google } = require("googleapis");
const credentials = require("../config/google-credentials.json");

const SHEET_ID = process.env.QUOTE_SHEET_ID; 
const SHEET_NAME = "Consultations"; 
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const saveToGoogleSheet = async (data) => {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const header = [
    "Name", "Email", "Phone", "Company", "Website",
    "Services", "Other Service", "Project Details",
    "Budget", "File URL", "Submitted At"
  ];

  const values = [[
    data.name,
    data.email,
    data.phone,
    data.company,
    data.website,
    data.services,
    data.otherService,
    data.projectDetails,
    data.budget,
    data.fileUrl,
    new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
  ]];

  // Check and format header only if not already set
  const getHeader = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A1:1`,
  });

  const sheetHasHeader = getHeader.data.values?.length > 0;

  if (!sheetHasHeader) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: "RAW",
      resource: {
        values: [header],
      },
    });

    // Apply header formatting
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0, // Default sheet/tab ID, change if needed
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  textFormat: {
                    bold: true,
                  },
                  backgroundColor: {
                    red: 0.95,
                    green: 0.85,
                    blue: 0.75,
                  },
                },
              },
              fields: "userEnteredFormat(backgroundColor,textFormat)",
            },
          },
        ],
      },
    });
  }

  // Append form data
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    resource: {
      values,
    },
  });
};

module.exports = saveToGoogleSheet;
