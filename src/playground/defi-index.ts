import CCXT from 'ccxt';
const { initExchange } = require('../exchange');
const exchange = initExchange(CCXT, undefined, 'ftx')

const symbols = ['BTC/USD', 'ETH/USD', 'BTC-PERP', 'ETH-PERP'];

(async () => {
    let since = exchange.milliseconds() - 3600 * 1000 * 24 // -1 day from now
    // alternatively, fetch from a certain starting datetime
    // let since = exchange.parse8601 ('2018-01-01T00:00:00Z')
    const symbol = symbols[1] // change for your symbol
    const limit = 10 // change for your limit
    
})()
