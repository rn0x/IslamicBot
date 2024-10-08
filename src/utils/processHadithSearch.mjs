import { Markup } from 'telegraf';
import sendMessageInChunks from './sendMessageInChunks.mjs';
import { searchHadith } from './searchHadith.mjs';
import { logError } from './logger.mjs';


/**
 * معالجة النص الوارد والبحث عن الحديث النبوي بناءً على الكلمة المفتاحية.
 * @param {object} ctx - السياق الخاص بالبوت.
 */
export default async function processHadithSearch(ctx) {
    const message_id = ctx?.message?.message_id;
    const messageText = ctx.message.text.trim();

    // التحقق مما إذا كانت النص يبدأ بكلمة "حديث "
    if (!messageText.startsWith("حديث")) {
        return; // لا تفعل شيئًا إذا لم تبدأ الكلمة بـ "حديث"
    }

    // استخراج الكلمة المفتاحية التي تأتي بعد "حديث "
    const keyword = messageText.split("حديث")[1]?.trim();

    // التحقق مما إذا كانت الكلمة المفتاحية فارغة
    if (!keyword) {
        return await ctx.reply('يرجى إدخال كلمة للبحث عنها في الأحاديث النبوية بعد "حديث".', { parse_mode: 'Markdown', reply_to_message_id: message_id });
    }

    const sources = ['bukhari', 'muslim', 'abudawud'];
    // حلقة للبحث في جميع المصادر
    for (let i = 0; i < sources.length; i++) {
        try {
            const searchResult = await searchHadith(keyword, sources[i]);
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
        } catch (error) {
            await ctx.reply('حدث خطأ أثناء البحث عن الحديث.', { parse_mode: 'Markdown', reply_to_message_id: message_id });
            logError('حدث خطأ أثناء البحث عن الحديث.', error);
        }
    }

    // إذا لم يتم العثور على نتائج في أي من المصادر
    return await ctx.reply(`لم يتم العثور على نتائج لكلمة البحث: "${keyword}".`, { reply_to_message_id: message_id });
}
