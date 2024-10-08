import { searchAyah } from './searchAyah.mjs';
import { Markup } from 'telegraf';
import sendMessageInChunks from './sendMessageInChunks.mjs';
import { logError } from './logger.mjs';

/**
 * معالجة النص الوارد والبحث عن الآيات بناءً على الكلمة المفتاحية.
 * @param {object} ctx - السياق الخاص بالبوت.
 */
export async function processAyahSearch(ctx) {
    const message_id = ctx?.message?.message_id;
    const messageText = ctx.message.text.trim();

    // التحقق مما إذا كانت النص يبدأ بكلمة "بحث "
    if (!messageText.startsWith("بحث")) {
        return; // لا تفعل شيئًا إذا لم تبدأ الكلمة بـ "بحث"
    }

    // استخراج الكلمة المفتاحية التي تأتي بعد "بحث "
    const keyword = messageText.split("بحث")[1]?.trim();

    // التحقق مما إذا كانت الكلمة المفتاحية فارغة
    if (!keyword) {
        return await ctx.reply('يرجى إدخال كلمة للبحث عنها في آيات القرآن الكريم بعد "بحث".', { parse_mode: 'Markdown', reply_to_message_id: message_id });
    }

    try {
        // البحث عن الآيات باستخدام معالج البحث
        const ayah = await searchAyah(keyword);

        if (ayah) {
            const { verseKey, verseText } = ayah;
            const [surahNumber, ayahNumber] = verseKey.split(':').map(Number);
            const defaultReciter = "ar.saoodshuraym";
            const response = await fetch(`https://api.alquran.cloud/v1/quran/${defaultReciter}`);
            const data = await response.json(); // تحويل الاستجابة إلى JSON

            // تحقق من حالة الاستجابة
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const surah = data.data.surahs.find(s => s.number === surahNumber);
            if (!surah) {
                await ctx.reply(`لم يتم العثور على السورة رقم ${surahNumber}.`, { parse_mode: 'Markdown', reply_to_message_id: message_id });
                return; // الخروج إذا لم يتم العثور على السورة
            }

            const currentAyah = surah.ayahs.find(a => a.numberInSurah === ayahNumber);
            if (!currentAyah) {
                await ctx.reply(`لم يتم العثور على الآية رقم ${ayahNumber} من سورة ${surah.name}.`, { parse_mode: 'Markdown', reply_to_message_id: message_id });
                return; // الخروج إذا لم يتم العثور على الآية
            }

            // تنسيق رسالة تحتوي على نص الآية ورقمها واسم السورة
            const formattedMessage = `📖 *${surah.name}* \n🔢 رقم الآية: *${ayahNumber}* \n\nالآية: ${verseText}`;

            // إضافة زر "التفسير"
            const but_1 = [Markup.button.callback('📜 عرض التفسير', `get_tafseer_${surahNumber}:${ayahNumber}`)]
            const buttons = Markup.inlineKeyboard([but_1]).reply_markup;
            // إرسال الرسالة المنسقة
            await sendMessageInChunks(ctx, formattedMessage, {
                parse_mode: 'Markdown',
                reply_to_message_id: message_id,
                reply_markup: buttons
            });

            // إرسال الصوت عبر الرابط مباشرةً
            const audioUrl = currentAyah.audio;
            const caption = `
🔊 *تلاوة الآية رقم ${ayahNumber} من سورة ${surah.name}*
            `;
            await ctx.sendAudio({ url: audioUrl, filename: `${ayahNumber}-${surah.name.replace(/\s+/g, '_')}.mp3` }, { caption: caption, parse_mode: 'Markdown', reply_to_message_id: message_id });

        } else {
            await ctx.reply(`لم يتم العثور على أي آيات للكلمة "${keyword}".`, { parse_mode: 'Markdown', reply_to_message_id: message_id });
        }
    } catch (error) {
        // معالجة الأخطاء بشكل أكثر تفصيلاً
        logError('حدث خطأ أثناء البحث عن الآيات.', error);
        await ctx.reply('حدث خطأ أثناء البحث عن الآيات.', { parse_mode: 'Markdown', reply_to_message_id: message_id });
    }
}