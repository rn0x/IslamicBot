import { Markup } from 'telegraf';
import sendMessageInChunks from './sendMessageInChunks.mjs';
import searchKhutbah from './searchKhutbah.mjs'; // دالة البحث عن الخطب
import { logError } from './logger.mjs';

/**
 * معالجة النص الوارد والبحث عن خطبة بناءً على الكلمة المفتاحية.
 * @param {object} ctx - السياق الخاص بالبوت.
 */
export default async function processKhutbahSearch(ctx) {
    const message_id = ctx?.message?.message_id;
    const messageText = ctx.message.text.trim();

    if (!messageText.startsWith("خطبة")) {
        return;
    }

    // استخراج الكلمة المفتاحية التي تأتي بعد "خطبة "
    const keyword = messageText.split("خطبة")[1]?.trim();


    // التحقق مما إذا كانت الكلمة المفتاحية فارغة
    if (!keyword) {
        return await ctx.reply(
            'يرجى إدخال كلمة للبحث عنها بعد "خطبة".',
            { parse_mode: 'Markdown', reply_to_message_id: message_id }
        );
    }

    // إرسال رسالة توضح أن البحث جاري
    const waitingMessage = await ctx.reply(
        '🔍 جاري البحث عن الخطبة، يرجى الانتظار...',
        { reply_to_message_id: message_id }
    );

    try {
        // البحث عن الخطب
        const searchResult = await searchKhutbah(keyword);

        if (searchResult.length > 0) {
            // إرسال النتائج إذا تم العثور عليها
            searchResult.slice(0, 1).forEach(async (result) => {
                let formattedMessage = `🕌 *${result.title}* 🕌\n\n`;
                formattedMessage += `📢 *الكاتب:* ${result.author?.name_prefix ? `${result.author.name_prefix} ` : ''}${result.author?.first_name || ''} ${result.author?.last_name || 'غير معروف'}\n`;
                formattedMessage += `📂 *الفئة:* ${result.category_text || 'غير مصنفة'}\n\n`;
                // formattedMessage += `📄 *محتوى الخطبة:* \n${result.rawContent.slice(0, 500)}...\n\n`; // عرض جزء من المحتوى فقط
                formattedMessage += `📄 *محتوى الخطبة:* \n${result.rawContent}...\n\n`; // عرض جزء من المحتوى فقط
                if (result.source_url) {
                    formattedMessage += `🔗 [رابط الخطبة](${result.source_url})`;
                }

                await sendMessageInChunks(ctx, formattedMessage, {
                    parse_mode: 'Markdown',
                    reply_to_message_id: message_id,
                    disable_web_page_preview: true,
                });
            });
        } else {
            // إذا لم يتم العثور على نتائج
            await ctx.reply(
                `لم يتم العثور على نتائج لكلمة البحث: "${keyword}".`,
                { reply_to_message_id: message_id }
            );
        }
    } catch (error) {
        await ctx.reply(
            'حدث خطأ أثناء البحث عن الخطبة.',
            { parse_mode: 'Markdown', reply_to_message_id: message_id }
        );
        logError('حدث خطأ أثناء البحث عن الخطبة.', error);
    }

    // محاولة حذف رسالة "جاري البحث"
    try {
        await ctx.deleteMessage(waitingMessage.message_id);
    } catch (deleteError) {
        logError('خطأ أثناء محاولة حذف الرسالة: ربما لا توجد صلاحية حذف.', deleteError);
    }
}