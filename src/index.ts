'use strict'
const CCXT = require('ccxt');
const { initExchange } = require('../exchange');
const { sheetAPI, append, get } = require('../sheet');
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
    const labelRequest = {
        spreadsheetId: spreadsheetId,
        range: 'Wallet!A1:1',
        majorDimension: "ROWS",
        valueRenderOption: 'FORMATTED_VALUE',
        dateTimeRenderOption: 'SERIAL_NUMBER',
    };
    // const localtime = new Date().toLocaleString('Asia/Tokyo')
    // console.log('localtime :>> ', localtime);
    const balance = (await exchange.fetchBalance()).total
    console.log('balance :>> ', balance);

    // await sheetAPI(append, request);
    const [label]: [string[]] = (await sheetAPI(get, labelRequest)).values
    console.log('label :>> ', label);

    let index = label.find((el) => el === 'Date') as unknown as number;
    /*    const data = [];
       data[index] = localtime;
   
       data.push(balance.label);
   */
    let wallet = label.reduce((acc, elem) => {
        acc[elem] = elem // or what ever object you want inside
        return acc
    }, {})
    console.log('wallet :>> ', wallet);
    for (const [key, value] of Object.entries(balance)) {
        wallet[key] = value;
    }
    console.log('wallet :>> ', wallet);

})() 