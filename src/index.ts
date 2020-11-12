const CCXT = require('ccxt');
const { initExchange } = require('../exchange');
const { sheetAPI, append, batchUpdate, get } = require('../sheet');
const exchange = initExchange(CCXT, undefined, 'ftx');

const spreadsheetId = process.env.spreadsheetId;
const range = 'Wallet!B1:E';
enum RequestType {
    Append,
    BatchUpdate,
    Get
}
const labelRequest = {
    spreadsheetId: spreadsheetId,
    range: 'Wallet!A1:1',
    majorDimension: "ROWS",
    valueRenderOption: 'FORMATTED_VALUE',
    dateTimeRenderOption: 'SERIAL_NUMBER',
};

const createWalletDate = (label: string[], balance: {}): [string[], number[]] => {
    const wallet = label.reduce((acc, elem) => {
        acc[elem] = 0
        return acc
    }, {});

    wallet["Date"] = new Date().toLocaleString('ja-JP');
    for (const [key, value] of Object.entries(balance)) {
        wallet[key] = value;
    }
    return [Object.keys(wallet), Object.values(wallet)];
}

(async () => {
    const balance = (await exchange.fetchBalance()).total

    const [label]: [string[]] = (await sheetAPI(get, labelRequest)).values;
    const [newlabel, row] = createWalletDate(label, balance);

    console.log('newlabel :>> ', newlabel);
    console.log('row :>> ', row);

    await sheetAPI(append, {
        spreadsheetId: spreadsheetId,
        range: "Wallet!B1:1",
        insertDataOption: 'INSERT_ROWS',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [row]
        }
    });

    await sheetAPI(batchUpdate, {
        "spreadsheetId": spreadsheetId,
        "resource": {
            "valueInputOption": 'USER_ENTERED',
            "data": {
                "range": "Wallet!A1:1",
                "majorDimension": "ROWS",
                "values": [label]
            },
        }
    });

})()

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
