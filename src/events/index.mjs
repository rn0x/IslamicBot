import { setupTextEvents } from './textEvents.mjs';
import { logError, logInfo } from "../utils/logger.mjs";
import handleMyChatMember from './handleMyChatMember.mjs'
import channelPost from './channelPost.mjs';


/**
 * إعداد جميع الأحداث الخاصة بالبوت
 * @param {object} client - عميل Telegraf.
 */
export function setupEvents(client, tableManager) {

    // هذه الفقرة تتعامل مع حدث my_chat_member لإدارة تغييرات عضوية المستخدمين في الدردشة.
    // يتم استخدام TableManager لتسجيل معلومات الأعضاء الجدد أو تحديث حالة الأعضاء الذين غادروا.
    // عند انضمام مستخدم جديد، يتم إضافة سجله إلى قاعدة البيانات.
    // وعند مغادرة المستخدم أو تغيير حالته (مثل الحذف)، يتم حذف سجله من قاعدة البيانات.
    // هذا يساعد في تتبع الأعضاء النشطين وتخزين معلومات دقيقة عن كل عضو في الدردشة.
    client.on('my_chat_member', async (ctx) => handleMyChatMember(ctx, tableManager));

    client.on('text', async (ctx) => setupTextEvents(ctx, tableManager));

    client.on('channel_post', async (ctx) => channelPost(ctx, tableManager));
}