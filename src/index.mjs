import "dotenv/config";
import { Telegraf, Markup, Scenes, session } from 'telegraf';
import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sqliteSessionMiddleware from './middlewares/sqliteSessionMiddleware.mjs';
import { logError, logInfo } from "./utils/logger.mjs";
import SQLiteManager from './utils/SQLiteManager.mjs'
import stage from './scenes/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const dbManager = new SQLiteManager('./database.db');


const options = { channelMode: true, voting: true };
const client = new Telegraf(process.env.TELEGRAM_TOKEN, options);

client.use(session());
client.use(sqliteSessionMiddleware());
client.use(stage.middleware());

client.command('start', (ctx) => {
    ctx.reply('Welcome to the bot!');
});

client.command('collect', (ctx) => {
    ctx.scene.enter('nameScene'); // الدخول إلى المشهد الأول
});

client.catch((error) => {
    logError('An error occurred:', error); // سجل الخطأ
    // يمكنك إضافة إجراءات إضافية هنا، مثل إبلاغ المستخدم أو إعادة تشغيل البوت
});

process.on('SIGINT', () => {
    // dbManager.close();
    process.exit();
});

client.launch().then(() => {
    logInfo('Bot is running...');
}).catch(error => {
    logError('Failed to launch the bot:', error);
});