import { searchAyah } from './searchAyah.mjs';
import { Markup } from 'telegraf';

/**
 * معالجة النص الوارد والبحث عن الآيات بناءً على الكلمة المفتاحية.
 * @param {object} ctx - السياق الخاص بالبوت.
 */
export async function processAyahSearch(ctx) {
    const message_id = ctx?.message?.message_id
    const messageText = ctx.message.text.trim();

    // التحقق مما إذا كانت النص يبدأ بكلمة "بحث "
    if (!messageText.startsWith("بحث")) {
        return; // لا تفعل شيئًا إذا لم تبدأ الكلمة بـ "بحث"
    }

    // استخراج الكلمة المفتاحية التي تأتي بعد "بحث "
    const keyword = messageText.split("بحث")[1];

    // التحقق مما إذا كانت الكلمة المفتاحية فارغة
    if (!keyword) {
        return await ctx.reply('يرجى إدخال كلمة للبحث عنها في آيات القرآن الكريم بعد "بحث".', { parse_mode: 'Markdown', reply_to_message_id: message_id });
    }

    try {

        // البحث عن الآيات باستخدام معالج البحث
        const ayahs = await searchAyah(keyword);

        if (ayahs && ayahs.length > 0) {
            await ctx.reply(`تم العثور على ${ayahs.length} آية. اختر لغة:`, { parse_mode: 'Markdown', reply_to_message_id: message_id });

            // عرض اللغات المتاحة
            const languages = ['ar', 'en', 'fr']; // قائمة اللغات المتاحة
            await ctx.reply('يرجى اختيار لغة:', {
                reply_markup: {
                    inline_keyboard: languages.map(lang => [
                        Markup.button.callback(lang, `lang_${lang}`)
                    ])
                },
                parse_mode: 'Markdown',
                reply_to_message_id: message_id
            });

            // تخزين الآيات في الجلسة
            ctx.session.ayahs = ayahs;
            ctx.session.message_id = message_id;
        } else {
            await ctx.reply(`لم يتم العثور على أي آيات للكلمة "${keyword}".`, { parse_mode: 'Markdown', reply_to_message_id: message_id });
        }
    } catch (error) {
        // معالجة الأخطاء بشكل أكثر تفصيلاً
        if (error.message.includes('404')) {
            ctx.reply(`عذراً، لم أتمكن من العثور على الكلمة "${keyword}" في القرآن.`, { parse_mode: 'Markdown', reply_to_message_id: message_id });
        } else {
            ctx.reply('حدث خطأ أثناء البحث عن الآيات.', { parse_mode: 'Markdown', reply_to_message_id: message_id });
        }
        console.error(error);
    }
}