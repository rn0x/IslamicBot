export default function handleMyChatMember(client, tableManager, logger) {

    const { logError, logInfo } = logger;
    client.on('my_chat_member', async (ctx) => {
        const chatId = ctx.chat.id;
        const userId = ctx.from.id;
        const status = ctx?.update?.my_chat_member?.new_chat_member?.status;

        const userData = {
            user_id: userId,
            username: ctx.from.username || null,
            first_name: ctx.from.first_name || null,
            last_name: ctx.from.last_name || null,
            is_bot: ctx.from.is_bot ? 1 : 0,
        };

        try {
            // تأكد من وجود المستخدم في جدول 'users'
            const existingUser = tableManager.dbManager.fetchData('users', ['user_id'], { user_id: userId });
            if (existingUser.length === 0) {
                const insertResult = tableManager.dbManager.insertData('users', userData);
                if (insertResult.changes === 0) {
                    throw new Error(`Failed to insert user ${userId} into 'users'.`);
                }
                const message = ctx.from.username ?
                    `مرحبا @${ctx.chat.username}، شكرًا لانضمامك!` :
                    `مرحبا ${ctx.chat.title || ctx.chat.first_name || ctx.chat.last_name}، شكرًا لانضمامك!`;

                await ctx.telegram.sendMessage(chatId, message);
                logInfo(`User ${userId} has been inserted into 'users'.`);
            }

            // تأكد من وجود الدردشة في جدول 'chats'
            const existingChat = tableManager.dbManager.fetchData('chats', ['chat_id'], { chat_id: chatId });
            if (existingChat.length === 0) {
                const chatData = {
                    chat_id: chatId,
                    chat_title: ctx.chat.title || ctx.from.first_name || ctx.from.last_name || 'Private Chat',
                    chat_type: ctx.chat.type || 'private',
                    chat_username: ctx.chat.username || null,
                    status: 'active', // يتم تعيين الحالة كـ "active" عند إنشاء الدردشة لأول مرة
                };
                const insertChatResult = tableManager.dbManager.insertData('chats', chatData);
                if (insertChatResult.changes === 0) {
                    throw new Error(`Failed to insert chat ${chatId} into 'chats'.`);
                }
                logInfo(`Chat ${chatId} has been inserted into 'chats'.`);
            }

            // تحديث حالة الدردشة بناءً على حالة المستخدم الجديدة
            if (status === 'left' || status === 'kicked') {
                tableManager.dbManager.updateData('chats', { status: status }, { chat_id: chatId });
                logInfo(`Chat ${chatId} status updated to: ${status}`);
            } else {
                tableManager.dbManager.updateData('chats', { status: 'active' }, { chat_id: chatId });
                logInfo(`Chat ${chatId} status updated to: active`);
            }

            // إدارة عضوية المستخدم في الدردشة في جدول 'chat_members'
            const existingMember = tableManager.dbManager.fetchData('chat_members', ['chat_id', 'user_id'], { chat_id: chatId, user_id: userId });
            const memberData = {
                chat_id: chatId,
                user_id: userId,
                role: status === 'administrator' ? 'admin' : 'member'
            };

            if (existingMember.length > 0) {
                // تحديث العضوية إذا كانت موجودة
                tableManager.dbManager.updateData('chat_members', memberData, { chat_id: chatId, user_id: userId });
                logInfo(`Membership for user ${userId} in chat ${chatId} has been updated.`);
            } else {
                // إضافة العضوية إذا لم تكن موجودة
                tableManager.dbManager.insertData('chat_members', memberData);
                logInfo(`Membership for user ${userId} has been inserted into 'chat_members'.`);
            }

        } catch (error) {
            logError('An error occurred while handling membership:', error);
        }
    });
}