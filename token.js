require('dotenv').config();
module.exports.token = {
    access_token: process.env.access_token,
    refresh_token: process.env.refresh_token,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    token_type: "Bearer",
    expiry_date: 1598602799325
}