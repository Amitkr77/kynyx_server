const { google } = require("googleapis");
const credentials = require("../config/google-credentials.json");

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const saveCareerToGoogleSheet = async (data) => {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = process.env.CAREER_SHEET_ID;
  const sheetName = "Career";

  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:I1`,
  });

  const isEmpty = !readRes.data.values || readRes.data.values.length === 0;

  if (isEmpty) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:I1`,
      valueInputOption: "RAW",
      resource: {
        values: [
          [
            "NAME",
            "EMAIL",
            "PHONE",
            "POSITION",
            "GITHUB",
            "LINKEDIN",
            "PORTFOLIO",
            "REFERRAL",
            "RESUME LINK",
          ],
        ],
      },
    });

    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetId = meta.data.sheets.find(s => s.properties.title === sheetName)?.properties.sheetId;

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
                  endColumnIndex: 9,
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: { bold: true },
                    backgroundColor: {
                      red: 0.88,
                      green: 0.63,
                      blue: 0.02, 
                    },
                  },
                },
                fields: "userEnteredFormat(textFormat,backgroundColor)",
              },
            },
          ],
        },
      });
    }
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:I`,
    valueInputOption: "RAW",
    resource: {
      values: [
        [
          data.name,
          data.email,
          data.phone,
          data.position,
          data.github,
          data.linkedIn,
          data.portfolio,
          data.referral,
          data.resume,
        ],
      ],
    },
  });
};

module.exports = saveCareerToGoogleSheet;
