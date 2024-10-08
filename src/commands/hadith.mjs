import { searchHadith } from '../utils/searchHadith.mjs';
import sendMessageInChunks from '../utils/sendMessageInChunks.mjs';

export default function searchHadithCommand(client) {

    client.command('hadith', async (ctx) => {
        const message_id = ctx?.message?.message_id;
        const query = ctx.message.text.split(' ').slice(1).join(' ').trim();
        if (!query) {
            return await ctx.reply('يرجى إدخال كلمة للبحث عنها في الأحاديث النبوية بعد "/hadith".', { parse_mode: 'Markdown', reply_to_message_id: message_id });
        }

        const sources = ['bukhari', 'muslim', 'abudawud'];
        let searchResult = [];

        // حلقة للبحث في جميع المصادر
        for (let i = 0; i < sources.length; i++) {
            searchResult = await searchHadith(query, sources[i]);
            if (searchResult.length > 0) {
                // إذا تم العثور على نتائج في أي مصدر، أرسل النتيجة وأخرج من الحلقة
                searchResult.slice(0, 1).forEach(async result => {
                    const formattedMessage = `
🌟 ${result.metadata.arabic.title} (${result.metadata.english.title}) 🌟
                                
📖 *الحديث (عربي):*
${result.textArabic}
                    
🌐 *الحديث (إنجليزي):*
${result.narrator}\n${result.textEnglish}`;

                    await sendMessageInChunks(ctx, formattedMessage, {
                        parse_mode: 'Markdown',
                        reply_to_message_id: message_id,
                    });
                });
                return; // الخروج بعد إرسال النتيجة
            }
        }

        // إذا لم يتم العثور على نتائج في أي من المصادر
        return await ctx.reply(`لم يتم العثور على نتائج لكلمة البحث: "${query}".`, { reply_to_message_id: message_id });
    });
}