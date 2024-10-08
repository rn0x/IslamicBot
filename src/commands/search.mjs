import { logError } from '../utils/logger.mjs';
import { searchAyah } from '../utils/searchAyah.mjs';
import { Markup } from 'telegraf';

export function searchCommand(client) {
    client.command('search', async (ctx) => {
        const message_id = ctx?.message?.message_id;
        const messageText = ctx.message.text.trim();

        // استخراج الكلمة المفتاحية بعد أمر "/search"
        const keyword = messageText.split(' ').slice(1).join(' ').trim(); // نأخذ جميع الكلمات بعد "/search"

        // التحقق مما إذا كانت الكلمة المفتاحية فارغة
        if (!keyword) {
            return await ctx.reply('يرجى إدخال كلمة للبحث عنها في آيات القرآن الكريم بعد "/search".', { parse_mode: 'Markdown', reply_to_message_id: message_id });
        }

        try {
            // البحث عن الآيات باستخدام معالج البحث
            const ayahs = await searchAyah(keyword);
            const verseKey = ayahs?.verseKey;            

            if (verseKey) {
                const [surahNumber, ayahNumber] = verseKey.split(':').map(Number);
                // await ctx.reply(`تم العثور على الآية رقم ${ayahNumber} من سورة رقم ${surahNumber}. اختر لغة:`, { parse_mode: 'Markdown', reply_to_message_id: message_id });
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
            logError(error);
        }
    });
}