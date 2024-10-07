export function helpCommand(client, tableManager) {
    client.command('help', async (ctx) => {
        const message_id = ctx?.message?.message_id;
        const botName = process.env.BOT_NAME || 'البوت'; // استيراد اسم البوت من ملف .env، افتراضياً "البوت"
        const repositoryLink = 'https://github.com/rn0x/IslamicBot'; // رابط المستودع

        // الحصول على إحصائيات البوت
        const userCount = await tableManager.dbManager.getCount('users'); // عدد المستخدمين

        // عدد المحادثات حسب الحالة
        const activeChatsCount = await tableManager.dbManager.getCount('chats', "status = 'active'"); // عدد المحادثات النشطة

        // عدد المحادثات المحظورة والمغادرة
        const kickedChatsCount = await tableManager.dbManager.getCount('chats', "status = 'kicked'"); // عدد المحادثات المحظورة
        const leftChatsCount = await tableManager.dbManager.getCount('chats', "status = 'left'"); // عدد المحادثات التي غادرها الأعضاء
        const totalKickedAndLeft = kickedChatsCount + leftChatsCount; // المجموع

        // عدد المحادثات حسب النوع
        const groupChatsCount = await tableManager.dbManager.getCount('chats', "chat_type = 'group'"); // عدد المحادثات العادية
        const superGroupChatsCount = await tableManager.dbManager.getCount('chats', "chat_type = 'supergroup'"); // عدد المحادثات السوبر جروب
        const channelCount = await tableManager.dbManager.getCount('chats', "chat_type = 'channel'"); // عدد القنوات

        const helpMessage = `**مرحبًا بك في ${botName}!**\n\n` +
            `هذا البوت الإسلامي يهدف إلى تقديم محتوى شامل ومفيد لك. \n` +
            `نحن نعمل باستمرار على تطوير البوت وإضافة ميزات جديدة لتلبية احتياجاتك كمسلم.\n\n` +
            `🔹 **إحصائيات البوت:**\n` +
            `   - عدد المستخدمين: ${userCount}\n` +
            `   - عدد المحادثات النشطة: ${activeChatsCount}\n` +
            `   - عدد المحادثات المحظورة والمغادرة: ${totalKickedAndLeft}\n` +
            `   - عدد المحادثات العادية: ${groupChatsCount}\n` +
            `   - عدد المحادثات السوبر جروب: ${superGroupChatsCount}\n` +
            `   - عدد القنوات: ${channelCount}\n\n` +
            `🔗 **لزيارة مستودع المشروع والمساهمة في تطويره:** [رابط المستودع](${repositoryLink})\n\n` +
            `نسأل الله تعالى أن يعلمنا ما ينفعنا وأن ينفعنا بما علمنا وأن يزيدنا علما وعملا وبركة فيهما إنه جواد كريم . وصلى الله وسلم على نبينا محمد وعلى اله وصحبه أجمعين.`;

        await ctx.reply(helpMessage, {
            parse_mode: 'Markdown',
            reply_to_message_id: message_id,
            disable_web_page_preview: true // تعطيل المعاينة الخاصة بالرابط
        });
    });
};