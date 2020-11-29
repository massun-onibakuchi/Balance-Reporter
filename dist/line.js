"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushMessage = void 0;
const config_1 = __importDefault(require("./config"));
exports.pushMessage = async (axiosBase, message, to = undefined) => {
    try {
        console.log('[Info]:Fired Line Notification');
        await axiosBase({
            method: 'POST',
            url: 'https://api.line.me/v2/bot/message/push',
            headers: {
                Authorization: `Bearer ${config_1.default.LINE.BEARER_ACCESS_TOKEN}`
            },
            data: {
                to: to || config_1.default.LINE.USER_ID,
                messages: message
            }
        });
    }
    catch (e) {
        console.log('[ERROR]:LINE_PUSH_MESSAGE_FAILED');
        console.log('e :>> ', e);
    }
};
