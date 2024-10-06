import { processAyahSearch } from '../utils/processAyahSearch.mjs';

/**
 * إعداد الأحداث الخاصة باستقبال النصوص (TEXT).
 * @param {object} client - عميل Telegraf.
 */
export function setupTextEvents(client) {
    // استجابة لحدث النص (عندما يرسل المستخدم كلمة)
    client.on('text', async (ctx) => {
        // استدعاء دالة معالجة البحث عن آية
        await processAyahSearch(ctx);
    });
}
