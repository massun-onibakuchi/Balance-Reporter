import { request } from "http";

const CCXT = require('ccxt');
const { initExchange } = require('../exchange');
const { sheetAPI, append, batchUpdate, get } = require('../sheet');
const exchange = initExchange(CCXT, undefined, 'ftx');

const spreadsheetId = process.env.spreadsheetId;
const range = 'Wallet!B1:E';
enum RequestType {
    Append,
    Update,
    Get
}
const labelRequest = {
    spreadsheetId: spreadsheetId,
    range: 'Wallet!A1:1',
    majorDimension: "ROWS",
    valueRenderOption: 'FORMATTED_VALUE',
    dateTimeRenderOption: 'SERIAL_NUMBER',
};

const createRequestBody = (ranges: string[]): unknown => {
    const labelRange = ranges[0] || 'Wallet!A1:1';
    const appendRange = ranges[1] || 'Wallet!B1:1';
    const updateRange = ranges[2] || 'Wallet!A1:1';
    const labelRequest = {
        spreadsheetId: spreadsheetId,
        range: appendRange,
        majorDimension: "ROWS",
        valueRenderOption: 'FORMATTED_VALUE',
        dateTimeRenderOption: 'SERIAL_NUMBER'
    }
    const appendRequest = {
        spreadsheetId: spreadsheetId,
        range: appendRange,
        insertDataOption: 'INSERT_ROWS',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: []
        }
    }
    const updateRequest = {
        spreadsheetId: spreadsheetId,
        resource: {
            valueInputOption: 'USER_ENTERED',
            data: {
                range: updateRange,
                majorDimension: "ROWS",
                values: []
            },
        }
    }
    const requests = [labelRequest, appendRequest, updateRequest];
    function requestBody(req, row) {
        if (req == RequestType.Get) return labelRequest;
        if (req == RequestType.Append) {
            appendRequest.resource.values = row
            return appendRequest
        }
        if (req == RequestType.Append) {
            updateRequest.resource.data.values = row
            return updateRequest
        }
    }
    return {
        requestBody(request) { requests[request] },
        setRange(type: string | number, range: any) { this[type] = range },
        getRequestBody: requestBody
    }
}

// Class RequestBody {
//     constructor(){
//         this.appendRange = 'Wallet!B1:1';
//         this.labelRange = 'Wallet!A1:1';
//         this.updateRange = 'Wallet!A1:1';
//     }
// }

const createWalletDate = (label: string[], balance: Object): [string[], number[]] => {
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
