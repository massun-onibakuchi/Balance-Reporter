'use strict'
const CCXT = require('ccxt');
const { initExchange } = require('./exchange');
const { sheetAPI, append, get } = require('./sheet');
const exchange = initExchange(CCXT, undefined, 'ftx');

const spreadsheetId = process.env.spreadsheetId;
const range = 'Wallet!B1:E';
const row = [];
(async () => {
    const request = {
        spreadsheetId: spreadsheetId,
        range: range,
        insertDataOption: 'INSERT_ROWS',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [row]
        }
    }
    const getRequest = {
        spreadsheetId: spreadsheetId,
        range: 'Wallet!B1:J',
        valueRenderOption: 'FORMATTED_VALUE',
        dateTimeRenderOption: 'SERIAL_NUMBER',
    };
    const wallet = (await exchange.fetchBalance()).total
    console.log('wallet :>> ', wallet);

    const label = sheetAPI(get, getRequest);
    console.log('label :>> ', label);



})()