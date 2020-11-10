"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const exchange_1 = __importDefault(require("../exchange"));
(async () => {
    const balance = await exchange_1.default.fetchBalance();
    console.log('balance :>> ', balance);
})();
