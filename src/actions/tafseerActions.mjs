/**
 * التعامل مع طلب عرض التفسير
 * @param {object} client - عميل Telegraf.
 * @param {Array} tafseerMouaser - مصفوفة بيانات التفسير الميسر
 */
export async function tafseerActions(client, tafseerMouaser) {

    client.action(/^get_tafseer_\d+:\d+$/, async (ctx) => {
        const callbackData = ctx.callbackQuery.data;
        const dataParts = callbackData.replace('get_tafseer_', '').split(':');
        const surahNumber = dataParts[0];
        const ayahNumber = dataParts[1];

        // البحث عن التفسير بناءً على رقم السورة ورقم الآية
        const tafseer = tafseerMouaser.find(a =>
            a.sura_no === surahNumber &&
            a.aya_no === ayahNumber
        );        

        if (tafseer) {
            const tafseerMessage = `📜 *التفسير الميسر للآية رقم ${ayahNumber} من سورة ${tafseer.sura_name_ar}:*\n\n${tafseer.aya_tafseer?.replace(/\[\d+\]/g, '')?.trim()}`;
            await ctx.reply(tafseerMessage, { parse_mode: 'Markdown', reply_to_message_id: ctx.callbackQuery.message.message_id });
        } else {
            await ctx.reply('لم يتم العثور على التفسير لهذه الآية.', { parse_mode: 'Markdown', reply_to_message_id: ctx.callbackQuery.message.message_id });
        }
    });
}
