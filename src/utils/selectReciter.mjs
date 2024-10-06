import fs from 'fs-extra';
import { Markup } from 'telegraf';

/**
 * عرض القراء المتاحين بناءً على اللغة المختارة.
 * @param {object} ctx - سياق التليجرام.
 * @param {string} selectedLanguage - اللغة المختارة.
 */
export async function selectReciter(ctx, selectedLanguage) {
    const recitersData = await fs.readJson('src/data/QuranAudio.json');
    const reciters = recitersData.filter(reciter => reciter.language === selectedLanguage);
    const message_id = ctx?.message?.message_id

    if (reciters.length === 0) {
        await ctx.reply('عذرًا، لا يوجد قراء متاحين لهذه اللغة.', { parse_mode: 'Markdown', reply_to_message_id: message_id });
        return;
    }

    // تقسيم الأزرار إلى صفوف
    const rows = [];
    const maxButtonsPerRow = 1; // عدد الأزرار في كل صف

    for (let i = 0; i < reciters.length; i += maxButtonsPerRow) {
        const row = reciters.slice(i, i + maxButtonsPerRow).map(reciter =>
            Markup.button.callback(reciter.name, `reciter_${reciter.identifier}`)
        );
        rows.push(row);
    }

    await ctx.reply('يرجى اختيار قارئ:', {
        reply_markup: {
            inline_keyboard: rows
        },
        parse_mode: 'Markdown',
        reply_to_message_id: message_id
    });
}
