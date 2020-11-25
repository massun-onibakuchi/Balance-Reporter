import CCXT, { bitbank } from 'ccxt';
import axiosBase from 'axios';
const { initExchange } = require('../exchange');
const exchange = initExchange(CCXT, undefined, 'ftx') as CCXT.Exchange;

const symbols = ['BTC/USD', 'ETH/USD', 'XRP/USD'];

interface Prices {
    symbol: {
        ask: number;
        bid: number;
        info: any;
        [excessProperty: string]: any;
    }
    [excessProperty: string]: any;
}
interface Tickers {
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
                ask: value["info"]["ask"],
                bid: value["info"]["bid"],
                cask: null,
                cbid: null,
            }
        }
        return Object.assign(target || {}, tickers)
    }
    const tickers = assignTickers(res, {});
    console.log('tickers :>> ', tickers);

    const addCPrices = async (tickers: Tickers, base: string): Promise<Tickers> => {
        const baseRate = (await axiosBase.get('https://api.exchangeratesapi.io/latest?base=' + base)).data.rates[base.toUpperCase()]
        for (const [, value] of Object.entries(tickers)) {
            value["cask"] = value["ask"] * baseRate;
            value["cbid"] = value["bid"] * baseRate;
        }
        return tickers;
    }
    const addBPrices = async (tickers: Tickers, exchange: CCXT.Exchange, symbols): Promise<Tickers> => {
        const res = await exchange.fetchTickers(symbols) as Prices;
        for (const [, value] of Object.entries(tickers)) {
            value["bask"] = res["info"]["ask"];
            value["bbid"] = res["info"]["bid"];
        }
        return tickers;
    }

    await addCPrices(tickers, 'USD');
    await addBPrices(tickers, bb, symbols.map((el) => el.replace('/USD', '')))
        .then((result) => {
            console.log(result);
        }).catch((err) => {

        });
    // const judgeOp = (tikers,level)=>{

    // }
    // const expectedReturn = ()=>{

    // }
    // const res = (await axios.get('indexes/DEFI/weights')).data.result
    // console.log('res :>> ', res);

    // const defiIndex = [];
    // for (const key in res) {
    //     defiIndex.push(key+'/USD');
    // }

})()
