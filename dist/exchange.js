"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initExchange = void 0;
const config_1 = __importDefault(require("./config"));
const setKeys = (exchangeId) => {
    if (config_1.default[exchangeId]["APIKEY"] && config_1.default[exchangeId]["APISECRET"]) {
        return {
            'APIKEY': config_1.default[exchangeId]["APIKEY"],
            'APISECRET': config_1.default[exchangeId]["APISECRET"]
        };
    }
    else
        Error('[ERROR]:CANNOT_FIND_APIKEYS');
};
/**
 *
 * @param {CCXT} ccxt ccxt
 * @param {String} path path to the api key and secret file
 * @param {String} exchangeId exchange name
 * @return {CCXT.Exchange} exchange
 */
exports.initExchange = (ccxt, exchangeId) => {
    const keys = setKeys(exchangeId.toUpperCase());
    const exchange = new ccxt[exchangeId.toLowerCase()]({
        'apiKey': keys.APIKEY,
        'secret': keys.APISECRET,
        'enableRateLimit': true,
        // 'verbose': true,
        'options': { 'adjustForTimeDifference': true }
    });
    if (process.env.NODE_ENV != 'production' && exchangeId.toUpperCase() == 'BITMEX') {
        exchange.urls['api'] = exchange.urls['test'];
    }
    return exchange;
};
