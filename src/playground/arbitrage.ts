import CCXT from 'ccxt';
import axiosBase from 'axios';
const { initExchange } = require('../exchange');
const exchange = initExchange(CCXT, undefined, 'ftx') as CCXT.Exchange;
import { pushMessage } from './line';
import { Prices, Tickers, ArbitrageCalculator, ArbitrageSet } from './arbitrageInterfaces';
import arbitrageConfig from './arbitrageConfig.json';

const symbols = ['BTC', 'ETH', 'XRP'];
const bb = new CCXT['bitbank']();

(async () => {
    const res = await exchange.fetchTickers(symbols.map(el => el + '/USD')) as Prices;

    const assignTickers = (prices: Prices, target: any): Tickers => {
        const tickers = {};
        for (const [key, value] of Object.entries(prices)) {
            tickers[key] = {
                symbol: key,
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

    const expectedReturn = (tickers: Tickers, arbitrageConfig): ArbitrageSet => {
        const calculator = {
            diffPercent: function () {
                return (typeof this.sellBasedJPY == 'number' && !isNaN(this.sellBasedJPY)) ? 100 * (this.sellBasedJPY / this.buy - 1) : NaN
            },
            sendFeeJPY: function () {
                return this.sendFeeCrypto * this.buy;
            },
            totalMoney: function () { return this.buy * this.quantity },
            profit: function () {
                return this.quantity * (this.diffPercent() * this.buy - this.tradeFeePercent * this.sellBasedJPY) / 100 - this.sendFeeCrypto * this.buy
            },
            expectedReturn: function () {
                return 100 * this.profit() / this.totalMoney()
            }
        } as ArbitrageCalculator
        for (const [key, value] of Object.entries(tickers)) {
            value["buy"] = value["cask"] - value["bbid"] > 0 ? value["bbid"] : null
            value["sellBasedUSD"] = value["bid"] - value["bbid"] > 0 ? value["bid"] : null
            value["sellBasedJPY"] = value["cask"] - value["bbid"] > 0 ? value["bid"] * value["rate"] : null
            value["quantity"] = arbitrageConfig[key]["fixedSize"]
                ? parseFloat(arbitrageConfig[key]["size"]) / value["bbid"]
                : parseFloat(arbitrageConfig[key]["quantity"]);
            value["tradeFeePercent"] = parseFloat(arbitrageConfig[key]["tradeFeePercent"]);
            value["sendFeeCrypto"] = parseFloat(arbitrageConfig[key]["sendFeeCrypto"]);
            Object.assign(value, calculator);
        }
        return tickers as ArbitrageSet
    }

    const judgeOp = (basis = 1, dataset: ArbitrageSet): ArbitrageCalculator | null => {
        let tmp //= { symbol: '', bestReturn: 0 };
        for (const [key, data] of Object.entries(dataset)) {
            tmp = (data.expectedReturn() > (tmp?.bestReturn || 0)) && { symbol: key, bestReturn: data.expectedReturn() }
        }
        if (tmp.bestReturn > basis) return dataset[tmp.symbol];
        return null;
    }

    let tickers = assignTickers(res, {});
    await addCPrices(tickers, 'USD', 'JPY');
    tickers = await addBPrices(tickers, bb, symbols.map(el => el + '/JPY'), 'USD');
    const dataset = expectedReturn(tickers, arbitrageConfig);

    for (const key in dataset) {
        if (Object.prototype.hasOwnProperty.call(dataset, key)) {
            const el = dataset[key];
            console.log('symbol >', el.symbol);
            console.log('裁定金額 ¥ >', el.totalMoney());
            console.log('送金手数料 crypto建 >', el.sendFeeCrypto);
            console.log('送金手数料 ¥ >', el.sendFeeJPY());
            console.log('割高 % >', el.diffPercent());
            console.log('profit ¥ >', el.profit());
            console.log('expectedReturn % >', el.expectedReturn());
        }
    }


    const data = judgeOp(1, dataset);
    const message = {
        type: "text",
        text: `${Date.now()}:${data.symbol}  ${data.totalMoney()} ${data.diffPercent()} ${data.expectedReturn()}`
    }

    pushMessage(axiosBase, message)


})()
