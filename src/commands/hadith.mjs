import { searchHadithApi } from '../utils/searchHadithApi.mjs';
import { searchHadith } from '../utils/searchHadith.mjs';
import sendMessageInChunks from '../utils/sendMessageInChunks.mjs';

export default function searchHadithCommand(client) {
    client.command('hadith', async (ctx) => {
        const message_id = ctx?.message?.message_id;
        const query = ctx.message.text.split(' ').slice(1).join(' ').trim();
        
        if (!query) {
            return await ctx.reply('يرجى إدخال كلمة للبحث عنها في الأحاديث النبوية بعد "/hadith".', { parse_mode: 'Markdown', reply_to_message_id: message_id });
        }

        try {
            // البحث باستخدام API
            const searchApiResult = await searchHadithApi(query);

            if (searchApiResult.length > 0) {
                // إذا تم العثور على نتائج من الـ API، إرسال النتيجة
                searchApiResult.slice(0, 1).forEach(async (hadith) => {
                    const formattedMessage = `
🌟 *الكتاب:* ${hadith.book} 🌟
                    
📖 *النص:*
${hadith.text}

📂 *الفصل:* ${hadith.chapter || 'غير متوفر'}
📑 *الصفحة:* ${hadith.page || 'غير متوفر'}
📚 *المجلد:* ${hadith.volume || 'غير متوفر'}

👥 *الرواة:* ${hadith.narrators.map(n => `${n.name} (${n.is_companion ? 'صحابي' : 'غير صحابي'})`).join(', ')}

⚖ *الأحكام الشرعية:* ${
    hadith.rulings.length > 0
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
            await ctx.reply('حدث خطأ أثناء البحث في API.', { parse_mode: 'Markdown', reply_to_message_id: message_id });
            console.error('API search error:', error);
        }

        // إذا لم تكن هناك نتائج من الـ API، البحث في المصادر التقليدية
        const sources = ['bukhari', 'muslim', 'abudawud'];
        
        for (let i = 0; i < sources.length; i++) {
            try {
                const searchResult = await searchHadith(query, sources[i]);
                if (searchResult.length > 0) {
                    // إذا تم العثور على نتائج في أي مصدر، أرسل النتيجة وأخرج من الحلقة
                    searchResult.slice(0, 1).forEach(async result => {
                        const formattedMessage = `
🌟 ${result.metadata.arabic.title} (${result.metadata.english.title}) 🌟
                            
📖 *الحديث (عربي):*
${result.textArabic}
                        
🌐 *الحديث (إنجليزي):*
${result.narrator}\n${result.textEnglish}`;

                        await sendMessageInChunks(ctx, formattedMessage, {
                            parse_mode: 'Markdown',
                            reply_to_message_id: message_id,
                        });
                    });
                    return; // الخروج بعد إرسال النتيجة
                }
            } catch (error) {
                await ctx.reply('حدث خطأ أثناء البحث عن الحديث.', { parse_mode: 'Markdown', reply_to_message_id: message_id });
                console.error('Traditional search error:', error);
            }
        }

        // إذا لم يتم العثور على نتائج في أي من المصادر
        return await ctx.reply(`لم يتم العثور على نتائج لكلمة البحث: "${query}".`, { reply_to_message_id: message_id });
    });
}