const exchange = require('./exchange');

(async () => {
    const balance = await exchange.fetchBalance()
    console.log('balance :>> ', balance);
})()