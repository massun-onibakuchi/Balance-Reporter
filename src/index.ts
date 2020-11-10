import exchange from '../exchange';

(async () => {
    const balance = await exchange.fetchBalance()
    console.log('balance :>> ', balance);
})()