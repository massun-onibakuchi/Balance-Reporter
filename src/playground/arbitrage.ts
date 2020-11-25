import CCXT from 'ccxt';
import axiosBase from 'axios';
const { initExchange } = require('../exchange');
const exchange = initExchange(CCXT, undefined, 'ftx') as CCXT.Exchange;

const symbols = ['BTC/USD', 'ETH/USD', 'XRP/USD'];

interface Prices {
    symbol: {
        ask: number;
        bid: number;
        info?: any;
        [excessProperty: string]: any;
    }
    [excessProperty: string]: any;
}
interface Tickers extends Prices {
    symbol: {
        ask: number;
        bid: number;
        cask: number | null;
        cbid: number | null;
        bask?: number | null;
        bbid?: number | null;
        [excessProperty: string]: any;
    }
}

const bb = new CCXT['bitbank']();

(async () => {

    const res = await exchange.fetchTickers(symbols) as Prices;

    const assignTickers = (prices: Prices, target: any): Tickers => {
        const tickers = {};
        for (const [key, value] of Object.entries(prices)) {
            tickers[key] = {
                ask: value["ask"],
                bid: value["bid"],
                cask: null,
                cbid: null,
            }
        }
        return Object.assign(target || {}, tickers)
    }
    const tickers = assignTickers(res, {});
    console.log('tickers :>> ', tickers);
    const usdjpy = (await axiosBase.get('https://api.exchangeratesapi.io/latest?base=USD')).data.rates.JPY
    console.log('usdjpy :>> ', usdjpy);

    const addCPrices = (tickers: Tickers, baseRate: number): Tickers => {
        for (const [, value] of Object.entries(tickers)) {
            value["cask"] = value["ask"] * baseRate;
            value["cbid"] = value["bid"] * baseRate;
        }
        return tickers;
    }
    const addBPrices = (tickers: Tickers, exchange:CCXT.Exchange): Tickers => {
        try {
            const res = await exchange.
        }
        for (const [, value] of Object.entries(tickers)) {
            value["bask"] =
                value["bbid"] = 
        }
        return tickers;
    }
    // const judgeOp = (tikers,level)=>{

    // }
    // const expectedReturn = ()=>{

    // }
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
