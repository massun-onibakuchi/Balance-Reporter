import CCXT from 'ccxt';
import axiosBase from 'axios';
const { initExchange } = require('../exchange');

const exchange = initExchange(CCXT, undefined, 'ftx');
const axiosbb = axiosBase.create({
    baseURL: 'http://ftx.com/api', // バックエンドB のURL:port を指定する
    headers: {
        'Content-Type': 'application/json',
    },
    responseType: 'json'
});

const axiosFiat = axiosBase.create({
    baseURL: ' https://api.exchangeratesapi.io/', // バックエンドB のURL:port を指定する
    headers: {
        'Content-Type': 'application/json',
    },
    responseType: 'json'
});

const symbols = ['BTC/USD', 'ETH/USD', 'XRP/USD'];

(async () => {
    const tickers = {}

    const res = await exchange.fetchTickers(symbols);
    const createTickers = (prices, target) => {
        if (target == undefined) {
            const tickers = {};
            for (const symbol of symbols) {
                tickers[symbol] = {
                    ask: prices[symbol]["ask"],
                    bid: prices[symbol]["bid"],
                    cask: undefined,
                    cbid: undefined
                }
            }
            return tickers
        }
        for (const symbol of symbols) {
            prices[symbol] = Object.defineProperties(target, {

            })
        }
    }

    const usdjpy = (await axiosFiat.get('latest?base=USD')).data.rates.JPY
    console.log('usdjpy :>> ', usdjpy);

    const convertBase = (tickers, baseRate) => {

    }
    // tickers.set(symbol, {
    //     ask: res[symbol]["ask"],
    //     bid: res[symbol]["bid"],
    //     cask: undefined,
    //     cbid: undefined
    // })

    // const res = (await axios.get('indexes/DEFI/weights')).data.result
    // console.log('res :>> ', res);

    // const defiIndex = [];
    // for (const key in res) {
    //     defiIndex.push(key+'/USD');
    // }

    // const tickers = await exchange.fetchTickers(symbols);

})()
