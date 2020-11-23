'use strict';

const CONFIG = require('./config.js');
const bitbank = require('node-bitbankcc');
const axios = require('axios');
const io = require('socket.io-client');
const socket = io('wss://stream.bitbank.cc', {
    transports: ['websocket']
});

const onConnect = () => {
    console.log('========');
    console.log('--socketconneted--');
    console.log('--socketconneted--', socket.connected, socket.id);
    socket.emit('message', (res) => {
        console.log('--Eve message calling emit() in socket.on()', res);
    });
    socket.emit('join-room', 'ticker_btc_jpy', (data) => {
        console.log('--calling emit() in socket.on()', data);
    });
};


const publicApi = new bitbank.PublicApi(CONFIG.PublicApiConfig);
const privateApi = new bitbank.PrivateApi(CONFIG.PrivateApiConfig);

const axiosBase = axios.create({
    baseURL: 'https://public.bitbank.cc/btc_jpy',
});

