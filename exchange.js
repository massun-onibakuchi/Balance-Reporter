'use strict';
require('dotenv').config();
const fs = require('fs');

/**
 * return api key and secret 
 * Synchronously reads the entire contents of a file 
 * if a file don't exist ,check env variable
 * @param {String} path path to the api key and secret file
 * @param {String} exchange exchange name
 */
const setKeys = (path, exchange) => {
    if (process.env.APIKEY == undefined || process.env.APISECRET == undefined) throw Error("NO_APIKEY")
    return {
        'APIKEY': process.env.APIKEY,
        'APISECRET': process.env.APISECRET
    }
    // try {
    //     const json = await fs.readFile(path);
    //     const config = JSON.parse(json);
    //     return {
    //         'APIKEY': config[exchange.toUpperCase()]['APIKEY'],
    //         'APISECRET': config[exchange.toUpperCase()]['APISECRET']
    //     }
    // }
    // catch (err) {
    //     console.log(err);
    //     if (process.env.APIKEY == undefined || process.env.APISECRET == undefined) throw Error("NO_APIKEY")
    //     else return {
    //         'APIKEY': process.env.APIKEY,
    //         'APISECRET': process.env.APISECRET
    //     }
    // }
}

/**
 * 
 * @param {CCXT} ccxt ccxt flamework
 * @param {String} path path to the api key and secret file
 * @param {String} exchangeId exchange name
 * @return {CCXT.EXCHANGE} exchange
 */
const initExchange = (ccxt, path = undefined, exchangeId) => {
    //   const exName = process.argv[2] === 'production' ? 'ftx' : 'bitmex';
    const keys = setKeys(path, exchangeId);
    const exchange = new ccxt[exchangeId.toLowerCase()]({
        'apiKey': keys.APIKEY,
        'secret': keys.APISECRET,
        'enableRateLimit': true,
        // 'verbose': true,
        'options': { 'adjustForTimeDifference': true }
    });
    if (exchangeId.toUpperCase() == 'BITMEX') {
        exchange.urls['api'] = exchange.urls['test'];
    }
    // exchange.urls['api'] = (exchangeId.toUpperCase() != 'BITMEX') && exchange.urls['test'];
    return exchange
}

module.exports = { initExchange }

// module.exports = ( function (path, exchangeId) {
//     //   const exName = process.argv[2] === 'production' ? 'ftx' : 'bitmex';
//     const keys =  setKeys(path, exchangeId);
//     const exchange = new ccxt[exchangeId.toLowerCase()]({
//         'apiKey': keys.APIKEY,
//         'secret': keys.APISECRET,
//         'enableRateLimit': true,
//         // 'verbose': true,
//         'options': { 'adjustForTimeDifference': true }
//     });
//     if (exchangeId.toUpperCase() == 'BITMEX') {
//         exchange.urls['api'] = exchange.urls['test'];
//     }
//     return exchange
// })(CONFIG_PATH, 'bitmex');
