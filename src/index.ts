const CCXT = require('ccxt');
const { initExchange } = require('../exchange');
const { sheetAPI, append, batchUpdate, get } = require('../sheet');
const exchange = initExchange(CCXT, undefined, 'ftx');

const spreadsheetId = process.env.spreadsheetId;
const range = 'Wallet!B1:E';
const hoge = {
    "valueInputOption": 'UER_ENTERD',
    "data": [
        {
            "range": "Wallet!A1:1",
            "majorDimension": "ROWS",
            "values": ["row"]
        }
    ],
    "includeValuesInResponse": false,
    "responseValueRenderOption": "FORMATTED_VALUE",
};

(async () => {
    const request = {
        spreadsheetId: spreadsheetId,
        range: range,
        insertDataOption: 'INSERT_ROWS',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [[12, 12, 12, 12]]
        }
    }
    const labelRequest = {
        spreadsheetId: spreadsheetId,
        range: 'Wallet!A1:1',
        majorDimension: "ROWS",
        valueRenderOption: 'FORMATTED_VALUE',
        dateTimeRenderOption: 'SERIAL_NUMBER',
    };
    const localtime = new Date().toLocaleString('ja-JP')
    console.log('localtime :>> ', localtime);
    const balance = (await exchange.fetchBalance()).total
    console.log('balance :>> ', balance);

    // await sheetAPI(append, request);
    let [label]: [string[]] = (await sheetAPI(get, labelRequest)).values;
    console.log('label :>> ', label);

    let index = label.find((el) => el === 'Date') as unknown as number;

    let wallet = label.reduce((acc, elem) => {
        acc[elem] = 0 // or what ever object you want inside
        return acc
    }, {})
    console.log('wallet :>> ', wallet);
    for (const [key, value] of Object.entries(balance)) {
        wallet[key] = value;
    }
    console.log('wallet :>> ', wallet);

    wallet["Date"] = localtime;
    const row = Object.values(wallet)
    label = Object.keys(wallet);
    console.log('row :>> ', row);

    // await sheetAPI(append, {
    //     spreadsheetId: spreadsheetId,
    //     range: "Wallet!B1:1",
    //     insertDataOption: 'INSERT_ROWS',
    //     valueInputOption: 'USER_ENTERED',
    //     resource: {
    //         values: [row]
    //     }
    // });

    const hoge2 = {
        "spreadsheetId": spreadsheetId,  // TODO: Update placeholder value.
        "resource": {
            "valueInputOption": 'USER_ENTERED',  // TODO: Update placeholder value.
            "data": {
                "range": "Wallet!A1:1",
                "majorDimension": "ROWS",
                "values": [label]
            },  // TODO: Update placeholder value.
        }
    }
    await sheetAPI(batchUpdate, hoge2);

})() 