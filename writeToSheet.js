const fs = require('fs');
require('dotenv').config();
const readline = require('readline');
const { google } = require('googleapis');
const sheetIdJson = require('../spreadsheetConfig.json');
const TOKEN = require('../gsToken');

// If modifying these scopes, delete token.json.
// https://www.googleapis.com/auth/spreadsheets.readonly
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

fs.open('token.json', 'wx', (err, fd) => {
    if (err) {
        if (err.code === 'EEXIST') return console.error('token.json already exists');
    }
    fs.writeFile('token.json', JSON.stringify(TOKEN), (err) => {
        if (err) return console.error(err);
        console.log('write to token.json');
    })
});

fs.readFile('credentials.json', (err, content) => {
    if (err) {
        console.log('Error loading client secret file:', err);
        if (process.env.client_secret == undefined) throw err
        console.log('set client secret from env variable');
        const credentials = {
            installed: {
                client_secret: process.env.client_secret,
                client_id: process.env.client_id,
                redirect_uris: process.env.redirect_uris
            }
        }
        fs.writeFile('credential.json', JSON.stringify(credentials), (err) => {
            if (err) return console.error(err);
            console.log('write to token.json');
        })
    }
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), appendValues, values);
    // authorize(JSON.parse(content), listMajors);
});

/**
 * write the param *values* to a google spread sheet
 * @param {any[][]} values The data to be written. Each item in the inner array corresponds with one cell.
 */
function writeToGS(values) {
    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
        if (process.env.client_secret == undefined) throw err
        else return authorize(JSON.parse(content), appendValues, values);
    })
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, values) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client, values);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1vKsP0f2DpDcbJaKnBGTILVsDoELN6P84Zj786LWqgbM/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 * @param {string[][]} values  The data to be written. Each item in the inner array corresponds with one cell.
 */
async function appendValues(auth, values) {
    const sheets = google.sheets({ version: 'v4', auth });
    const request = {
        // The ID of the spreadsheet to update.
        spreadsheetId: sheetIdJson.spreadsheetId,  // TODO: Update placeholder value.

        // The A1 notation of a range to search for a logical table of data.
        // Values are appended after the last row of the table.
        range: 'Class Data!A1:E',  // TODO: Update placeholder value.

        // How the input data should be interpreted.
        valueInputOption: 'USER_ENTERED',  // TODO: Update placeholder value.

        // How the input data should be inserted.
        insertDataOption: 'INSERT_ROWS',  // TODO: Update placeholder value.

        resource: {
            values
        },
    };
    try {
        const response = (await sheets.spreadsheets.values.append(request)).data;
        // TODO: Change code below to process the `response` object:
        console.log(JSON.stringify(response, null, 2));
    } catch (err) {
        console.error(err);
    }
}

module.exports = { writeToGS };