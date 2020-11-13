const fs = require('fs').promises;
// require('dotenv').config();

const CREDENTIALS_PATH = 'credentials1.json'
const TOKEN_PATH = 'token1.json'

const credentials = {
    installed: {
        client_id: process.env.client_id,
        client_secret: process.env.client_secret,
        redirect_uris: process.env.redirect_uris
    }
}
const token = {
    access_token: process.env.access_token,
    refresh_token: process.env.refresh_token,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    token_type: "Bearer",
    expiry_date: 1605062558223
}
const init = async (data, path) => {
    try {
        await fs.readFile(path);
    } catch (err) {
        console.log('err :>> ', err);
        if (err.code === 'ENOENT') {
            await fs.writeFile(path, JSON.stringify(data));
            console.log('Stored to', path);
        } else throw err;
    }
}
init(credentials,CREDENTIALS_PATH);
init(token,TOKEN_PATH);