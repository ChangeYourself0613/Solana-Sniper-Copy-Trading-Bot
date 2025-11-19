import TelegramBot from 'node-telegram-bot-api';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '../constants';
import { logger } from './logger';





export async function sendNewTokenAlert(mintAddress: string) {
    const telegramBotToken = String(TELEGRAM_BOT_TOKEN);
    const telegramChatId = String(TELEGRAM_CHAT_ID);
    const bot = new TelegramBot(telegramBotToken, { polling: false });
    const message = `
    😊New Token Detected!😊
    Mint Address: ${mintAddress} \n
    https://gmgn.ai/sol/token/${mintAddress}
    `;
    try {
        await bot.sendMessage(telegramChatId, message);

    } catch (error) {
        console.error('Error sending Telegram alert:', error);
    }
}
