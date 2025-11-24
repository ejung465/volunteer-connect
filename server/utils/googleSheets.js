import { google } from 'googleapis';
import path from 'path';
import process from 'process';

// If credentials don't exist, we'll just log a warning and skip
// This allows the app to run without crashing if Sheets isn't set up
let sheets = null;
let spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

try {
    const credentialsPath = path.join(process.cwd(), 'credentials.json');
    const auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    sheets = google.sheets({ version: 'v4', auth });
} catch (error) {
    console.warn('Google Sheets credentials not found or invalid. Sheets integration disabled.');
}

export async function syncUserReport(user) {
    if (!sheets || !spreadsheetId) {
        console.log('Skipping Sheets sync: No credentials or Spreadsheet ID');
        return;
    }

    try {
        const date = new Date().toISOString().split('T')[0];
        const values = [
            [date, user.firstName + ' ' + user.lastName, user.email, user.role]
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:D', // Assumes Sheet1 exists
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values,
            },
        });
        console.log(`Synced user ${user.email} to Google Sheet`);
    } catch (error) {
        console.error('Error syncing to Google Sheet:', error);
    }
}
