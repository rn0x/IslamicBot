import fetch from 'node-fetch';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logError } from '../utils/logger.mjs';
import { Markup } from 'telegraf';

/**
 * إعداد الأحداث الخاصة باختيار القارئ.
 * @param {object} client - عميل Telegraf.
 */
export function setupReciterActions(client) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    client.action(/reciter_(.+)/, async (ctx) => {
        const selectedReciter = ctx.match[1];
        ctx.session.selectedReciter = selectedReciter;

        // الحصول على جميع الآيات الموجودة في الجلسة
        const ayahs = ctx.session.ayahs;
        const message_id = ctx?.session?.message_id

        // التحقق مما إذا كانت الآيات موجودة
        if (!ayahs || ayahs.length === 0) {
            return await ctx.reply('لا توجد آيات متاحة للاختيار.', { parse_mode: 'Markdown', reply_to_message_id: message_id });
        }

        try {
            const response = await fetch(`https://api.alquran.cloud/v1/quran/${selectedReciter}`);
            const data = await response.json();  // تحويل الاستجابة إلى JSON

            // التحقق من حالة الاستجابة
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const verseKey = ayahs.verseKey;
            const [surahNumber, ayahNumber] = verseKey.split(':').map(Number);

            const surah = data.data.surahs.find(s => s.number === surahNumber);

            // تحقق إذا كانت السورة موجودة
            if (!surah) {
                await ctx.reply(`لم يتم العثور على السورة رقم ${surahNumber}.`, { parse_mode: 'Markdown', reply_to_message_id: message_id });
            }

            // العثور على الآية في السورة باستخدام numberInSurah
            const currentAyah = surah.ayahs.find(a => a.numberInSurah === ayahNumber);

            if (currentAyah) {
                const surahName = surah.name;  // اسم السورة
                const ayahNumber = currentAyah.numberInSurah;  // رقم الآية

                // تنسيق النص ليظهر اسم السورة ورقم الآية
                const formattedText = `📖 *${surahName}* \n🔢 رقم الآية: *${ayahNumber}* \n\nالآية: ${currentAyah.text}`;
                const but_1 = [Markup.button.callback('📜 عرض التفسير', `get_tafseer_${surahNumber}:${ayahNumber}`)]
                const buttons = Markup.inlineKeyboard([but_1]).reply_markup;

                await ctx.reply(formattedText, { parse_mode: 'Markdown', reply_to_message_id: message_id, reply_markup: buttons });  // إرسال النص المنسق
                await ctx.replyWithAudio({ url: currentAyah.audio }, { reply_to_message_id: message_id });  // إرسال صوت الآية
            } else {
                await ctx.reply(`لم يتم العثور على الآية رقم ${ayahNumber} في السورة رقم ${surahNumber}.`, { parse_mode: 'Markdown', reply_to_message_id: message_id });
            }

        } catch (error) {
            logError('حدث خطأ أثناء جلب الصوت:', error);
            await ctx.reply('حدث خطأ أثناء جلب صوت الآية.', { parse_mode: 'Markdown', reply_to_message_id: message_id });
        }
    });
}
