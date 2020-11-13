const CCXT = require('ccxt');
const { initExchange } = require('../exchange');
const { sheetAPI, append, batchUpdate, get } = require('../sheet');
const exchange = initExchange(CCXT, undefined, 'ftx');

const spreadsheetId = process.env.spreadsheetId;

enum RequestType {
    Append,
    Get,
    Update,
}

const createRequestBody = (ranges: string[]): any => {
    const labelRange = ranges[0] || 'Wallet!A1:1';
    const appendRange = ranges[1] || 'Wallet!B1:1';
    const updateRange = ranges[2] || 'Wallet!A1:1';
    const labelRequest = {
        spreadsheetId: spreadsheetId,
        range: labelRange,
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
    function requestBody(req, row) {
        if (req == RequestType.Get) return labelRequest;
        if (req == RequestType.Append) {
            appendRequest.resource.values.push(row)
            return appendRequest
        }
        if (req == RequestType.Update) {
            updateRequest.resource.data.values.push(row);
            return updateRequest
        }
    }
    // const requests = [labelRequest, appendRequest, updateRequest];
    return {
        // requestBody(request) { requests[request] },
        // setRange(type: string | number, range: any) { this[type] = range },
        getRequestBody: requestBody
    }
}

const createWalletDate = (labels: string[], data: Object): [string[], number[]] => {
    const wallet = labels.reduce((acc, elem) => {
        acc[elem] = 0
        return acc
    }, {});

    wallet["Date"] = wallet["Date"] || new Date().toLocaleString('ja-JP');
    for (const [key, value] of Object.entries(data)) {
        wallet[key] = value;
    }
    return [Object.keys(wallet), Object.values(wallet)];
}

const requestBody = createRequestBody(['Wallet!A1:1', 'Wallet!B1:1', 'Wallet!A1:1']);

(async () => {
    const symbols = ['BTC/USD', 'ETH/USD']
    let prices = {
        USD: 1,
        USDT: 1
    };
    const labelRequest = requestBody.getRequestBody(RequestType.Get);

    const [sheetLabel]: [string[]] = (await sheetAPI(get, labelRequest)).values;
    const balance = (await exchange.fetchBalance()).total

    const [newlabel, row] = createWalletDate(sheetLabel, balance);
    console.log('newlabel :>> ', newlabel);
    console.log('row :>> ', row);
    
    const appendRequest = requestBody.getRequestBody(RequestType.Append, row);
    const updateRequest = requestBody.getRequestBody(RequestType.Update, newlabel);
    // await sheetAPI(append, appendRequest);
    // await sheetAPI(batchUpdate, updateRequest);
    
    const tickers = await exchange.fetchTickers(symbols);
    for (const symbol of symbols) {
        const label = symbol.slice(0, 3);
        prices[label] = tickers[symbol]["close"];
    }
    const [, priceRow] = createWalletDate(newlabel, prices);
    console.log('priceRow :>> ', priceRow);

    await sheetAPI(append, requestBody.getRequestBody(RequestType.Append, priceRow));

})()

// const hoge = {
//     "valueInputOption": 'UER_ENTERD',
//     "data": [
//         {
//             "range": "Wallet!A1:1",
//             "majorDimension": "ROWS",
//             "values": ["row"]
//         }
//     ],
//     "includeValuesInResponse": false,
//     "responseValueRenderOption": "FORMATTED_VALUE",
// };
