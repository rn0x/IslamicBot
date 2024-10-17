import { logInfo } from "../utils/logger.mjs";

export default function dbChat(ctx, tableManager) {
    const chatId = ctx.chat.id;
    const userId = ctx.from.id;

    const userData = {
        user_id: userId,
        username: ctx.from.username || null,
        first_name: ctx.from.first_name || null,
        last_name: ctx.from.last_name || null,
        is_bot: ctx.from.is_bot ? 1 : 0,
    };


    // تأكد من وجود المستخدم في جدول 'users'
    const existingUser = tableManager.dbManager.fetchData('users', ['user_id'], { user_id: userId });
    if (existingUser.length === 0) {
        const insertResult = tableManager.dbManager.insertData('users', userData);
        if (insertResult.changes === 0) {
            logInfo(`Failed to insert user ${userId} into 'users'.`);
        }
    }    

    // تأكد من وجود الدردشة في جدول 'chats'
    const existingChat = tableManager.dbManager.fetchData('chats', ['chat_id'], { chat_id: chatId });
    if (existingChat.length === 0) {
        tableManager.dbManager.updateData('chats', { status: 'active' }, { chat_id: chatId });
        const chatData = {
            chat_id: chatId,
            chat_title: ctx.chat.title || ctx.from.first_name || ctx.from.last_name || 'Private Chat',
            chat_type: ctx.chat.type || 'private',
            chat_username: ctx.chat.username || null,
            status: 'active',
        };
        const insertChatResult = tableManager.dbManager.insertData('chats', chatData);
        if (insertChatResult.changes === 0) {
            logInfo(`Failed to insert chat ${chatId} into 'chats'.`);
        } else {
            logInfo(`Chat ${chatId} has been inserted into 'chats'.`);
        }
    }

    // إدارة عضوية المستخدم في الدردشة في جدول 'chat_members'
    const existingMember = tableManager.dbManager.fetchData('chat_members', ['chat_id', 'user_id'], { chat_id: chatId, user_id: userId });
    const memberData = {
        chat_id: chatId,
        user_id: userId,
        role: 'member'
    };

    if (existingMember.length === 0) {
        // إضافة العضوية إذا لم تكن موجودة
        tableManager.dbManager.insertData('chat_members', memberData);
        logInfo(`Membership for user ${userId} has been inserted into 'chat_members'.`);
    }

}