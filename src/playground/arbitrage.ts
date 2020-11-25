import CCXT from 'ccxt';
import axiosBase from 'axios';
const { initExchange } = require('../exchange');
const exchange = initExchange(CCXT, undefined, 'ftx') as CCXT.Exchange;
import arbitrageConfig from './arbitrageConfig.json';

const symbols = ['BTC', 'ETH', 'XRP'];

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
        bask: number | null;
        bbid: number | null;
        rate: number | null;
        [excessProperty: string]: any;
    }
}

const bb = new CCXT['bitbank']();

(async () => {

    const res = await exchange.fetchTickers(symbols.map(el => el + '/USD')) as Prices;

    const assignTickers = (prices: Prices, target: any): Tickers => {
        const tickers = {};
        for (const [key, value] of Object.entries(prices)) {
            tickers[key] = {
                ask: value["ask"],
                bid: value["bid"],
                cask: null,
                cbid: null,
                bask: null,
                bbid: null,
                rate: null
            }
        }
        return Object.assign(target || {}, tickers)
    }
    let tickers = assignTickers(res, {});

    const addCPrices = async (tickers: Tickers, base: string, target: string): Promise<Tickers> => {
        const baseRate = (await axiosBase.get('https://api.exchangeratesapi.io/latest?base=' + base.toUpperCase())).data.rates[target.toUpperCase()]
        console.log(`${base.toUpperCase()}/${target.toUpperCase()}:${baseRate}`);

        for (const [, value] of Object.entries(tickers)) {
            value["cask"] = value["ask"] * baseRate;
            value["cbid"] = value["bid"] * baseRate;
            value["rate"] = baseRate;
        }
        return tickers;
    }
    const addBPrices = async (tickers: Tickers, exchange: CCXT.Exchange, symbols: string[], base): Promise<Tickers> => {
        for (const symbol of symbols) {
            const res = await exchange.fetchTicker(symbol)
            tickers[symbol.replace('/JPY', '/USD')]["bask"] = res["ask"];
            tickers[symbol.replace('/JPY', '/USD')]["bbid"] = res["bid"];
        }
        return tickers;
    }

    await addCPrices(tickers, 'USD', 'JPY');
    tickers = await addBPrices(tickers, bb, symbols.map(el => el + '/JPY'), 'USD');

    interface ArbitrageObject extends Tickers {
        buy: number;
        sellBasedUSD: number;
        sellBasedJPY: number;
        quantity: number;
        tradeFeePercent: number;
        sendFeeCrypto: number;
        diffPercent: () => number;
        sendFeeJPY: () => number;
        totalMoney: () => number;
        profit: () => number;
        expectedReturn: () => number;
    }

    const expectedReturn = (tickers: Tickers, arbitrageConfig): ArbitrageObject => {
        const arbitrageObj = Object.assign(tickers)
        const calculator = {
            diffPercent: function () {
                return (typeof this.sellBasedJPY == 'number') ? 100 * (this.sell / this.buy - 1) : NaN
            },
            sendFeeJPY: function () {
                return this.sendFeeCrypto * this.buy;
            },
            totalMoney: function () { return this.buy * this.quantity },
            profit: function () {
                return this.quantity * (this.diffPercent() * this.buy - this.tradeFeePercent * this.sellBasedJPY) / 100 - this.sendFeeCrypto * this.buy
            },
            expectedReturn: function () {
                return 100 * this.profit() / this.totalMoney
            }
        };
        for (const [key, value] of Object.entries(arbitrageObj)) {
            value["buy"] = value["cask"] - value["bbid"] > 0 ? value["bbid"] : null
            value["sellBasedUSD"] = value["ask"] - value["bbid"] > 0 ? value["ask"] : null
            value["sellBasedJPY"] = value["cask"] - value["bbid"] > 0 ? value["ask"] * value["rate"] : null
            value["quantity"] = parseFloat(arbitrageConfig[key]["quantity"]);
            value["tradeFeePercent"] = parseFloat(arbitrageConfig[key]["tradeFeePercent"]);
            value["sendFeeCrypto"] = parseFloat(arbitrageConfig[key]["sendFeeCrypto"]);
            Object.assign(value, calculator);
        }
        return arbitrageObj
    }

    const dataset = expectedReturn(tickers, arbitrageConfig);
    for (const key in dataset) {
        if (Object.prototype.hasOwnProperty.call(dataset, key)) {
            const el = dataset[key];
            console.log('el :>> ', el);
            console.log('el.totalMoney :>> ', el.totalMoney());
            console.log('el.sendFeeJPY :>> ', el.sendFeeJPY());
            console.log('el.diffPercent() :>> ', el.diffPercent());
            console.log('el.profit() :>> ', el.profit());
            console.log('el.expectedReturn() :>> ', el.expectedReturn());
        }
    }
    // function TradeConfig(quantity, tradeFee, sendFeeCrypto) {
    //     this.quantity = quantity
    //     this.tradeFee = tradeFee
    //     this.sendFeeCrypto = sendFeeCrypto
    // }
    // const res = (await axios.get('indexes/DEFI/weights')).data.result
    // console.log('res 1 res);

    // const defiIndex = [];
    // for (const key in res) {
    //     defiIndex.push(key+'/USD');
    // }

})()
