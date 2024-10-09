import { Markup } from 'telegraf';
import sendMessageInChunks from './sendMessageInChunks.mjs';
import { searchFatwa } from './searchFatwa.mjs'; // تأكد من وجود دالة البحث عن الفتوى
import { logError } from './logger.mjs';

/**
 * معالجة النص الوارد والبحث عن الفتوى بناءً على الكلمة المفتاحية.
 * @param {object} ctx - السياق الخاص بالبوت.
 */
export default async function processFatwaSearch(ctx) {
    const message_id = ctx?.message?.message_id;
    const messageText = ctx.message.text.trim();

    // التحقق مما إذا كانت النص يبدأ بكلمة "فتوى "
    if (!messageText.startsWith("فتوى")) {
        return; // لا تفعل شيئًا إذا لم تبدأ الكلمة بـ "فتوى"
    }

    // استخراج الكلمة المفتاحية التي تأتي بعد "فتوى "
    const keyword = messageText.split("فتوى")[1]?.trim();

    // التحقق مما إذا كانت الكلمة المفتاحية فارغة
    if (!keyword) {
        return await ctx.reply('يرجى إدخال كلمة للبحث عنها في الفتاوى بعد "فتوى".', { parse_mode: 'Markdown', reply_to_message_id: message_id });
    }

    // إرسال رسالة توضح أن البحث جاري
    const waitingMessage = await ctx.reply('🔍 جاري البحث عن الفتوى، يرجى الانتظار...', { reply_to_message_id: message_id });

    try {
        // البحث في الفتاوى
        const searchResult = await searchFatwa(keyword);

        if (searchResult.length > 0) {
            // إذا تم العثور على نتائج، أرسل النتيجة
            searchResult.slice(0, 1).forEach(async result => {
                let formattedMessage = `📜 *${result.title}* 📜\n\n`;
                formattedMessage += '❓ *السؤال:* \n';
                formattedMessage += `${result.question}\n\n`;
                formattedMessage += '📜 *الإجابة:* \n';
                formattedMessage += `${result.answer}\n\n`;
                formattedMessage += `🔗 [رابط الفتوى](${result.link})`;

                await sendMessageInChunks(ctx, formattedMessage, {
                    parse_mode: 'Markdown',
                    reply_to_message_id: message_id,
                    disable_web_page_preview: true
                });
            });
        } else {
            // إذا لم يتم العثور على نتائج
            await ctx.reply(`لم يتم العثور على نتائج لكلمة البحث: "${keyword}".`, { reply_to_message_id: message_id });
        }
    } catch (error) {
        await ctx.reply('حدث خطأ أثناء البحث عن الفتوى.', { parse_mode: 'Markdown', reply_to_message_id: message_id });
        logError('حدث خطأ أثناء البحث عن الفتوى.', error);
    }

    // محاولة حذف رسالة "جاري البحث" إذا كان لديه الصلاحية
    try {
        await ctx.deleteMessage(waitingMessage.message_id);
    } catch (deleteError) {
        logError('خطأ أثناء محاولة حذف الرسالة: ربما لا توجد صلاحية حذف.', deleteError);
    }
}