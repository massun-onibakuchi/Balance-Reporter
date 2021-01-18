"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ccxt_1 = __importDefault(require("ccxt"));
const exchange_1 = require("./exchange");
const sheet_1 = require("./sheet");
const config_1 = __importDefault(require("./config"));
const exchange = exchange_1.initExchange(ccxt_1.default, 'ftx');
const priceRange = 'Price!A1:1';
const walletRanges = ['Wallet!A1:1', 'Wallet!B1:1', 'Wallet!A1:1'];
const symbols = ['BTC/USD', 'ETH/USD', 'AMPL/USD', 'XRP/USD', 'FTT/USD', 'YFI/USD'];
var RequestType;
(function (RequestType) {
    RequestType[RequestType["Append"] = 0] = "Append";
    RequestType[RequestType["Get"] = 1] = "Get";
    RequestType[RequestType["Update"] = 2] = "Update";
})(RequestType || (RequestType = {}));
const createRequestBody = (ranges) => {
    const defaultRanges = ranges;
    const labelRequest = {
        spreadsheetId: config_1.default.SPREAD_SHEET.SHEET_ID,
        range: '',
        majorDimension: "ROWS",
        valueRenderOption: 'FORMATTED_VALUE',
        dateTimeRenderOption: 'SERIAL_NUMBER'
    };
    const appendRequest = {
        spreadsheetId: config_1.default.SPREAD_SHEET.SHEET_ID,
        range: '',
        insertDataOption: 'INSERT_ROWS',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: []
        }
    };
    const updateRequest = {
        spreadsheetId: config_1.default.SPREAD_SHEET.SHEET_ID,
        resource: {
            valueInputOption: 'USER_ENTERED',
            data: {
                range: '',
                majorDimension: "ROWS",
                values: []
            },
        }
    };
    function requestBody(req, row, range) {
        if (req == RequestType.Get) {
            labelRequest.range = range || defaultRanges[0];
            return labelRequest;
        }
        ;
        if (req == RequestType.Append) {
            appendRequest.range = range || defaultRanges[1];
            appendRequest.resource.values = [row];
            return appendRequest;
        }
        if (req == RequestType.Update) {
            updateRequest.resource.data.range = range || defaultRanges[2];
            updateRequest.resource.data.values = [row];
            return updateRequest;
        }
    }
    // const requests = [labelRequest, appendRequest, updateRequest];
    return {
        // requestBody(request) { requests[request] },
        // setRange(type: string | number, range: any) { this[type] = range },
        getRequestBody: requestBody
    };
};
const createWalletData = (labels, data) => {
    const wallet = labels.reduce((acc, elem) => {
        acc[elem] = 0;
        return acc;
    }, {});
    // new Date(Date.now() - new Date().getTimezoneOffset() * 60 * 1000)// 日本時間表記
    wallet["Date"] = new Date().toISOString(); //ISO表記のUTC時間
    for (const [key, value] of Object.entries(data)) {
        wallet[key] = value;
    }
    return [Object.keys(wallet), Object.values(wallet)];
};
const requestBody = createRequestBody(walletRanges);
const main = async () => {
    let prices = {
        USD: 1,
        USDT: 1
    };
    const labelRequest = requestBody.getRequestBody(RequestType.Get);
    // fetch label from sheet
    const [sheetLabel] = (await sheet_1.sheetAPI(sheet_1.get, labelRequest)).values;
    // fetch wallet (spot)
    const balance = (await exchange.fetchBalance()).total;
    const [newlabel, holdings] = createWalletData(sheetLabel, balance);
    console.log('newlabel :>> ', newlabel);
    console.log('holdings :>> ', holdings);
    const appendRequest = requestBody.getRequestBody(RequestType.Append, holdings);
    const updateRequest = requestBody.getRequestBody(RequestType.Update, newlabel);
    await sheet_1.sheetAPI(sheet_1.append, appendRequest);
    await sheet_1.sheetAPI(sheet_1.batchUpdate, updateRequest);
    // fetch close price from exchange
    const tickers = await exchange.fetchTickers(symbols);
    for (const symbol of symbols) {
        const label = symbol.replace('/USD', '');
        prices[label] = tickers[symbol]["close"];
    }
    const [, priceRow] = createWalletData(newlabel, prices);
    console.log('priceRow :>> ', priceRow);
    // append price info to the sheet 
    await sheet_1.sheetAPI(sheet_1.append, requestBody.getRequestBody(RequestType.Append, priceRow, priceRange));
};
try {
    main();
}
catch (e) {
    console.log('UNIEXPECTED ERROR :>> ', e);
    process.exit(1);
}
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
