import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { processAyahSearch } from '../utils/processAyahSearch.mjs';
import processHadithSearch from '../utils/processHadithSearch.mjs';

/**
 * إعداد الأحداث الخاصة باستقبال النصوص (TEXT).
 * @param {object} client - عميل Telegraf.
 */
export function setupTextEvents(client) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // استجابة لحدث النص (عندما يرسل المستخدم كلمة)
    client.on('text', async (ctx) => {
        // استدعاء دالة معالجة البحث عن آية
        await processAyahSearch(ctx);
        await processHadithSearch(ctx);
    });
}
