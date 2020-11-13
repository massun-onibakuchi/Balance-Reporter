const fs = require('fs').promises;
require('dotenv').config();

const TOKEN_PATH = 'token.json'
const CREDENTIALS_PATH = 'credentials.json'

const init = async () => {
    try {
        const content = await fs.readFile(CREDENTIALS_PATH);
    } catch (err) {
        console.log('err :>> ', err);
        const data = {
            installed: {
                client_id: process.env.client_id,
                client_secret: process.env.client_secret,
                redirect_uris: process.env.redirect_uris
            }
        }
        await fs.writeFile(CREDENTIALS_PATH, JSON.stringify(data));
    }
    try {
        const token = await fs.readFile(TOKEN_PATH)
    } catch (err) {
        const data = {
            access_token: process.env.access_token,
            refresh_token: process.env.refresh_token,
            scope: "https://www.googleapis.com/auth/spreadsheets",
            token_type: "Bearer", "expiry_date": 1605062558223
        }
        await fs.writeFile(CREDENTIALS_PATH, JSON.stringify(data));
        console.log('err :>> ', err);
    }
}
(async () => await init());