import { Markup } from 'telegraf';
import sendMessageInChunks from '../utils/sendMessageInChunks.mjs';
import searchKhutbah from '../utils/searchKhutbah.mjs'; // تأكد من وجود دالة البحث عن الخطب
import { logError } from '../utils/logger.mjs';

/**
 * إعداد أمر البحث عن الخطب
 * 
 * @param {object} client - عميل Telegraf المستخدم للتفاعل مع Telegram API.
 */
export default function searchKhutbahCommand(client) {
    client.command('khutbah', async (ctx) => {
        const message_id = ctx?.message?.message_id;
        const messageText = ctx.message.text.trim();

        // استخدام هذا لاستخراج الكلمة المفتاحية
        const query = messageText.split(' ').slice(1).join(' ').trim();

        // التحقق مما إذا كانت الكلمة المفتاحية فارغة
        if (!query) {
            return await ctx.reply('يرجى إدخال كلمة للبحث عنها في الخطب بعد "/khutbah".', { parse_mode: 'Markdown', reply_to_message_id: message_id });
        }

        // إرسال رسالة توضح أن البحث جاري
        const waitingMessage = await ctx.reply('🔍 جاري البحث عن الخطبة، يرجى الانتظار...', { reply_to_message_id: message_id });

        try {
            // البحث في الخطب
            const searchResult = await searchKhutbah(query);

            if (searchResult.length > 0) {
                // إذا تم العثور على نتائج، أرسل النتيجة
                searchResult.slice(0, 1).forEach(async result => {
                    let formattedMessage = `🕌 *${result.title}* 🕌\n\n`;
                    formattedMessage += `📢 *الكاتب:* ${result.author?.name_prefix ? `${result.author.name_prefix} ` : ''}${result.author?.first_name || ''} ${result.author?.last_name || 'غير معروف'}\n`;
                    formattedMessage += `📂 *الفئة:* ${result.category_text || 'غير مصنفة'}\n\n`;
                    formattedMessage += `📄 *محتوى الخطبة:* \n${result.rawContent}...\n\n`; // عرض جزء من المحتوى فقط
                    if (result.source_url) {
                        formattedMessage += `🔗 [رابط الخطبة](${result.source_url})`;
                    }

                    await sendMessageInChunks(ctx, formattedMessage, {
                        parse_mode: 'Markdown',
                        reply_to_message_id: message_id,
                        disable_web_page_preview: true
                    });
                });
            } else {
                // إذا لم يتم العثور على نتائج
                await ctx.reply(`لم يتم العثور على نتائج لكلمة البحث: "${query}".`, { reply_to_message_id: message_id });
            }
        } catch (error) {
            await ctx.reply('حدث خطأ أثناء البحث عن الخطبة.', { parse_mode: 'Markdown', reply_to_message_id: message_id });
            logError('حدث خطأ أثناء البحث عن الخطبة.', error);
        }

        // محاولة حذف رسالة "جاري البحث" إذا كان لديه الصلاحية
        try {
            await ctx.deleteMessage(waitingMessage.message_id);
        } catch (deleteError) {
            logError('خطأ أثناء محاولة حذف الرسالة: ربما لا توجد صلاحية حذف.', deleteError);
        }
    });
}