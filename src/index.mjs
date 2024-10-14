import * as dotenv from 'dotenv';
dotenv.config();
import { Telegraf, Markup, Scenes, session } from 'telegraf';
import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sqliteSessionMiddleware from './middlewares/sqliteSessionMiddleware.mjs';
import { logError, logInfo } from "./utils/logger.mjs";
import TableManager from './utils/TableManager.mjs'
import stage from './scenes/index.mjs';
import { setupActions } from './actions/index.mjs';
import { setupEvents } from './events/index.mjs';
import { setupCommands } from './commands/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// إنشاء مدير الجداول وتحديد مسار قاعدة البيانات
const dbPath = path.join(__dirname, '../database/database.db');
const tableManager = new TableManager(dbPath);  // تهيئة الجداول عند بدء البوت

const client = new Telegraf(process.env.TELEGRAM_TOKEN);

client.use(session());
client.use(sqliteSessionMiddleware());
client.use(stage.middleware());


client.command('collect', (ctx) => {
    ctx.scene.enter('nameScene'); // الدخول إلى المشهد الأول
});

client.on('new_chat_members', async (ctx) => {
    // console.log(ctx);
});
client.on('left_chat_member', async (ctx) => {
    // console.log(ctx);
});


// إعداد جميع الإجراءات الخاصة بالأزرار، مثل التعامل مع ضغطات الأزرار (callback queries) والردود المتفاعلة مع المستخدم
setupActions(client);

// إعداد جميع الأوامر المخصصة التي يمكن للمستخدمين استخدامها، مثل الأوامر /start و/help
setupCommands(client, tableManager);

// إعداد جميع الأحداث الخاصة بالبوت، مثل الاستماع للرسائل والنوعيات المختلفة من التحديثات (مثل الصور، الفيديو، الرسائل الصوتية، إلخ)
setupEvents(client, tableManager);

client.catch((error) => {
    logError('An error occurred:', error); // سجل الخطأ
});


client.launch();
logInfo('Bot is running...');

process.once('SIGINT', () => {
    logInfo('Received SIGINT, stopping bot...');
    // تأكد من إغلاق قاعدة البيانات قبل إنهاء البوت
    tableManager.dbManager.close();  // إغلاق قاعدة البيانات
    client.stop('SIGINT');
    logInfo('Bot stopped gracefully.');
    process.exit();
});

process.once('SIGTERM', () => {
    logInfo('Received SIGTERM, stopping bot...');
    // تأكد من إغلاق قاعدة البيانات قبل إنهاء البوت
    tableManager.dbManager.close();  // إغلاق قاعدة البيانات
    client.stop('SIGTERM');
    logInfo('Bot stopped gracefully.');
    process.exit();
});