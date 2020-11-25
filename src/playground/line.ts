import { AxiosStatic } from 'axios';
import CONFIG from '../config.json';

interface Message {
    type: 'text';
    text: string
}

export const pushMessage = async (axiosBase: AxiosStatic, message: Message, to = undefined) => {
    try {
        await axiosBase.post('https://api.line.me/v2/bot/message/push', {
            headers: {
                Authorization: CONFIG.LINE.BEAR_ACCESS_TOKEN
            },
            data: {
                to: to || CONFIG.LINE.USER_ID,
                messages: [message]
            }
        })
    } catch (e) {
        console.log('[ERROR]:LINE_PUSH_MESSAGE_FAILED');
        console.log('e :>> ', e);
    }
}