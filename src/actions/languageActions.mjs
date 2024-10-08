import { Markup } from 'telegraf';
import { selectReciter } from '../utils/selectReciter.mjs';

/**
 * إعداد الأحداث الخاصة باختيار اللغة.
 * @param {object} client - عميل Telegraf.
 */
export function setupLanguageActions(client) {
    client.action(/lang_(.+)/, async (ctx) => {
        const selectedLanguage = ctx.match[1];
        const message_id = ctx?.session?.message_id
        ctx.session.selectedLanguage = selectedLanguage;

        // await ctx.reply(`تم اختيار اللغة: ${selectedLanguage}. اختر قارئ:`, { parse_mode: 'Markdown', reply_to_message_id: message_id });
        // عرض القراء بناءً على اللغة المختارة
        await selectReciter(ctx, selectedLanguage);
    });
}