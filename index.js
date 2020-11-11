'use strict'
const CCXT = require('ccxt');
const { initExchange } = require('./exchange');
const exchange = initExchange(CCXT, undefined, 'ftx');

(async () => {
    // console.log('exchange :>> ', exchange);

    const balance = (await exchange.fetchBalance()).total
    console.log('balance :>> ', balance);

    
})()