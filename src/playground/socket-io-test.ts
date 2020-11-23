// import axios from 'axios';
import { io } from 'socket.io-client';
const socket = io('wss://stream.bitbank.cc');
// const CONFIG = require('./config.js');
// const bitbank = require('node-bitbankcc');

// const onConnect = () => {
//     console.log('========');
//     console.log('--socketconneted--');
//     console.log('--socketconneted--', socket.connected, socket.id);
//     socket.emit('message', (res) => {
//         console.log('--Eve message calling emit() in socket.on()', res);
//     });
//     socket.emit('join-room', 'ticker_btc_jpy', (data) => {
//         console.log('--calling emit() in socket.on()', data);
//     });
// };
socket.connect()
// socket.emit('join-room', 'depth_diff_eth_jpy')
socket.on('open', function open() {
    socket.send('join-room', 'depth_diff_eth_jpy')
})
socket.on('message', function incoming(data) {
    console.log('data :>> ', data);
})



// const publicApi = new bitbank.PublicApi(CONFIG.PublicApiConfig);
// const privateApi = new bitbank.PrivateApi(CONFIG.PrivateApiConfig);

// const axiosBase = axios.create({
//     baseURL: 'https://public.bitbank.cc/btc_jpy',
// });

