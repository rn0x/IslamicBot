import fetch from 'node-fetch';  // استيراد مكتبة node-fetch
import { logError } from '../utils/logger.mjs';

/**
 * إعداد الأحداث الخاصة باختيار القارئ.
 * @param {object} client - عميل Telegraf.
 */
export function setupReciterActions(client) {
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

            // إرسال كل آية واحدة تلو الأخرى
            for (const ayah of ayahs) {
                const surah = data.data.surahs.find(s => s.number === ayah.surah.number);

                // تحقق إذا كانت السورة موجودة
                if (!surah) {
                    await ctx.reply(`لم يتم العثور على السورة رقم ${ayah.surah.number}.`, { parse_mode: 'Markdown', reply_to_message_id: message_id });
                    continue;  // الانتقال للآية التالية
                }

                // العثور على الآية في السورة باستخدام numberInSurah
                const currentAyah = surah.ayahs.find(a => a.numberInSurah === ayah.numberInSurah);

                if (currentAyah) {
                    const surahName = surah.name;  // اسم السورة
                    const ayahNumber = currentAyah.numberInSurah;  // رقم الآية

                    // تنسيق النص ليظهر اسم السورة ورقم الآية
                    const formattedText = `📖 سورة: *${surahName}* \n🔢 رقم الآية: *${ayahNumber}* \n\nالآية: ${currentAyah.text}`;

                    await ctx.reply(formattedText, { parse_mode: 'Markdown', reply_to_message_id: message_id });  // إرسال النص المنسق
                    await ctx.replyWithAudio({ url: currentAyah.audio }, { reply_to_message_id: message_id });  // إرسال صوت الآية
                } else {
                    await ctx.reply(`لم يتم العثور على الآية رقم ${ayah.numberInSurah} في السورة رقم ${ayah.surah.number}.`, { parse_mode: 'Markdown', reply_to_message_id: message_id });
                }
            }
        } catch (error) {
            logError('حدث خطأ أثناء جلب الصوت:', error);
            await ctx.reply('حدث خطأ أثناء جلب صوت الآية.', { parse_mode: 'Markdown', reply_to_message_id: message_id });
        }
    });
}
