import { searchFatwa } from '../utils/searchFatwa.mjs';
import sendMessageInChunks from '../utils/sendMessageInChunks.mjs';

export default function searchFatwaCommand(client) {
    client.command('fatwa', async (ctx) => {
        const message_id = ctx?.message?.message_id;
        const query = ctx.message.text.split(' ').slice(1).join(' ').trim();
        
        if (!query) {
            return await ctx.reply('يرجى إدخال كلمة للبحث عنها في الفتاوى بعد "/fatwa".', { parse_mode: 'Markdown', reply_to_message_id: message_id });
        }

        // إرسال رسالة توضح أن البحث جاري
        const waitingMessage = await ctx.reply('🔍 جاري البحث عن الفتوى، يرجى الانتظار...', { reply_to_message_id: message_id });

        try {
            // البحث في الفتاوى
            const searchResult = await searchFatwa(query);
            if (searchResult.length > 0) {
                // إذا تم العثور على نتائج، أرسل النتيجة
                searchResult.slice(0, 1).forEach(async result => {
                    const formattedMessage = `
📜 *${result.title}* 📜

❓ *السؤال:*
${result.question}

📜 *الإجابة:*
${result.answer}

🔗 [رابط الفتوى](${result.link})
                    `;

                    // إرسال الرسالة النصية
                    await sendMessageInChunks(ctx, formattedMessage, {
                        parse_mode: 'Markdown',
                        reply_to_message_id: message_id,
                        disable_web_page_preview: true
                    });

                    // إرسال ملف الصوت مباشرة
                    if (result.audio) {
                        const fileName = `${result.title.replace(/\s+/g, '_')}.mp3`;
                        await ctx.replyWithAudio({ url: result.audio, filename: fileName }, { reply_to_message_id: message_id });
                    }
                });
            } else {
                await ctx.reply(`لم يتم العثور على نتائج لكلمة البحث: "${query}".`, { reply_to_message_id: message_id });
            }
        } catch (error) {
            await ctx.reply('حدث خطأ أثناء البحث عن الفتوى.', { parse_mode: 'Markdown', reply_to_message_id: message_id });
            console.error('Fatwa search error:', error);
        }

        // محاولة حذف رسالة "جاري البحث" إذا كان لديه الصلاحية
        try {
            await ctx.deleteMessage(waitingMessage.message_id);
        } catch (deleteError) {
            console.error('خطأ أثناء محاولة حذف الرسالة: ربما لا توجد صلاحية حذف.', deleteError);
            // يمكن إرسال رسالة توضيحية أو تجاهل الخطأ بدون أي إجراء إضافي
        }
    });
}