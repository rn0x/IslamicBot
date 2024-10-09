import { Markup } from 'telegraf';
import sendMessageInChunks from './sendMessageInChunks.mjs';
import { searchHadith } from './searchHadith.mjs';
import { logError } from './logger.mjs';
import { searchHadithApi } from './searchHadithApi.mjs';
import convertHtmlToText from './convertHtmlToText.mjs';

/**
 * معالجة النص الوارد والبحث عن الحديث النبوي بناءً على الكلمة المفتاحية.
 * @param {object} ctx - السياق الخاص بالبوت.
 */
export default async function processHadithSearch(ctx) {
    const message_id = ctx?.message?.message_id;
    const messageText = ctx.message.text.trim();
    const useApi = true; // لإستعمال api الخاص بالمنصة الحديثية 

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

    if (useApi) {
        try {
            // البحث باستخدام API
            const searchApiResult = await searchHadithApi(keyword);

            if (searchApiResult.length > 0) {
                // إذا تم العثور على نتائج من الـ API، إرسال النتيجة
                searchApiResult.slice(0, 1).forEach(async (hadith) => {
                    const rawHadithText = convertHtmlToText(hadith.text);
                    const formattedMessage = `
        🌟 *الكتاب:* ${hadith.book} 🌟
    
        📖 *النص:*
        ${rawHadithText}
    
        📂 *الفصل:* ${hadith.chapter || 'غير متوفر'}
        📑 *الصفحة:* ${hadith.page || 'غير متوفر'}
        📚 *المجلد:* ${hadith.volume || 'غير متوفر'}
    
        👥 *الرواة:* ${hadith.narrators.map(n => `${n.name} (${n.is_companion ? 'صحابي' : 'غير صحابي'})`).join(', ')}
    
        ⚖ *الأحكام الشرعية:* ${hadith.rulings.length > 0
                            ? hadith.rulings.map(r => `الحكم: ${r.ruling} - ${r.scholar} (${r.book})`).join('\n')
                            : 'لا يوجد أحكام مرفقة'
                        }
    
        🌐 *الموقع المنصة الحديثية*:
        [alminasa.ai](https://alminasa.ai/contact)`;

                    await sendMessageInChunks(ctx, formattedMessage, {
                        parse_mode: 'Markdown',
                        reply_to_message_id: message_id,
                        disable_web_page_preview: true
                    });
                });
                return; // الخروج بعد إرسال النتيجة
            }

        } catch (error) {
            await ctx.reply('حدث خطأ أثناء البحث عن الحديث في الـ API.', { parse_mode: 'Markdown', reply_to_message_id: message_id });
            logError('حدث خطأ أثناء البحث في الـ API.', error);
        }
    }

    // إذا لم تكن هناك نتائج من الـ API، البحث في المصادر التقليدية
    const sources = ['bukhari', 'muslim', 'abudawud'];

    for (let i = 0; i < sources.length; i++) {
        try {
            const searchResult = await searchHadith(keyword, sources[i]);

            if (searchResult.length > 0) {
                // إذا تم العثور على نتائج في أي مصدر، أرسل النتيجة وأخرج من الحلقة
                searchResult.slice(0, 1).forEach(async result => {
                    let formattedMessage = `🌟 ${result.metadata.arabic.title} (${result.metadata.english.title}) 🌟\n\n`;
                    formattedMessage += '📖 *الحديث (عربي):* \n'
                    formattedMessage += `${result.textArabic} \n\n`
                    formattedMessage += '🌐 *الحديث (إنجليزي):* \n'
                    formattedMessage += `${result.narrator}\n${result.textEnglish} `;

                    await sendMessageInChunks(ctx, formattedMessage, {
                        parse_mode: 'Markdown',
                        reply_to_message_id: message_id,
                    });
                });
                return; // الخروج بعد إرسال النتيجة
            }
        } catch (error) {
            await ctx.reply('حدث خطأ أثناء البحث عن الحديث.', { parse_mode: 'Markdown', reply_to_message_id: message_id });
            logError('حدث خطأ أثناء البحث عن الحديث في المصدر.', error);
        }
    }

    // إذا لم يتم العثور على نتائج في أي من المصادر
    return await ctx.reply(`لم يتم العثور على نتائج لكلمة البحث: "${keyword}".`, { reply_to_message_id: message_id });
}