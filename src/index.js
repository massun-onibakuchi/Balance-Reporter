"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var CCXT = require('ccxt');
var initExchange = require('./exchange').initExchange;
var _a = require('./sheet'), sheetAPI = _a.sheetAPI, append = _a.append, batchUpdate = _a.batchUpdate, get = _a.get;
var exchange = initExchange(CCXT, undefined, 'ftx');
var init = require('./set').init;
var spreadsheetId = process.env.spreadsheetId;
var priceRange = 'Price!A1:1';
var walletRanges = ['Wallet!A1:1', 'Wallet!B1:1', 'Wallet!A1:1'];
var symbols = ['BTC/USD', 'ETH/USD'];
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_PATH = 'token.json';
var CREDENTIALS_PATH = 'credentials.json';
var credentials = {
    installed: {
        client_id: process.env.client_id,
        client_secret: process.env.client_secret,
        redirect_uris: process.env.redirect_uris
    }
};
var token = {
    access_token: process.env.access_token,
    refresh_token: process.env.refresh_token,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    token_type: "Bearer",
    expiry_date: 1605062558223
};
var RequestType;
(function (RequestType) {
    RequestType[RequestType["Append"] = 0] = "Append";
    RequestType[RequestType["Get"] = 1] = "Get";
    RequestType[RequestType["Update"] = 2] = "Update";
})(RequestType || (RequestType = {}));
var createRequestBody = function (ranges) {
    var defaultRanges = ranges || ['Wallet!A1:1', 'Wallet!B1:1', 'Wallet!A1:1'];
    var labelRequest = {
        spreadsheetId: spreadsheetId,
        range: '',
        majorDimension: "ROWS",
        valueRenderOption: 'FORMATTED_VALUE',
        dateTimeRenderOption: 'SERIAL_NUMBER'
    };
    var appendRequest = {
        spreadsheetId: spreadsheetId,
        range: '',
        insertDataOption: 'INSERT_ROWS',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: []
        }
    };
    var updateRequest = {
        spreadsheetId: spreadsheetId,
        resource: {
            valueInputOption: 'USER_ENTERED',
            data: {
                range: '',
                majorDimension: "ROWS",
                values: []
            }
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
var createWalletData = function (labels, data) {
    var wallet = labels.reduce(function (acc, elem) {
        acc[elem] = 0;
        return acc;
    }, {});
    wallet["Date"] = wallet["Date"] || new Date().toLocaleString('ja-JP');
    for (var _i = 0, _a = Object.entries(data); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        wallet[key] = value;
    }
    return [Object.keys(wallet), Object.values(wallet)];
};
var requestBody = createRequestBody(walletRanges);
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var prices, labelRequest, sheetLabel, balance, _a, newlabel, row, appendRequest, updateRequest, tickers, _i, symbols_1, symbol, label, _b, priceRow;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                prices = {
                    USD: 1,
                    USDT: 1
                };
                labelRequest = requestBody.getRequestBody(RequestType.Get);
                return [4 /*yield*/, sheetAPI(get, labelRequest)];
            case 1:
                sheetLabel = (_c.sent()).values[0];
                return [4 /*yield*/, exchange.fetchBalance()];
            case 2:
                balance = (_c.sent()).total;
                _a = createWalletData(sheetLabel, balance), newlabel = _a[0], row = _a[1];
                console.log('newlabel :>> ', newlabel);
                console.log('row :>> ', row);
                appendRequest = requestBody.getRequestBody(RequestType.Append, row);
                updateRequest = requestBody.getRequestBody(RequestType.Update, newlabel);
                return [4 /*yield*/, sheetAPI(append, appendRequest)];
            case 3:
                _c.sent();
                return [4 /*yield*/, sheetAPI(batchUpdate, updateRequest)];
            case 4:
                _c.sent();
                return [4 /*yield*/, exchange.fetchTickers(symbols)];
            case 5:
                tickers = _c.sent();
                for (_i = 0, symbols_1 = symbols; _i < symbols_1.length; _i++) {
                    symbol = symbols_1[_i];
                    label = symbol.slice(0, 3);
                    prices[label] = tickers[symbol]["close"];
                }
                _b = createWalletData(newlabel, prices), priceRow = _b[1];
                console.log('priceRow :>> ', priceRow);
                return [4 /*yield*/, sheetAPI(append, requestBody.getRequestBody(RequestType.Append, priceRow, priceRange))];
            case 6:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); };
try {
    init(CREDENTIALS_PATH, credentials);
    init(TOKEN_PATH, token);
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
