import { startCommand } from './start.mjs';
import { helpCommand } from './help.mjs';
import { searchCommand } from './search.mjs'
import searchHadithCommand from './hadith.mjs';

/**
 * إعداد جميع الأوامر الخاصة بالبوت
 * 
 * هذه الدالة تقوم بإعداد الأوامر الأساسية للبوت مثل أمر البدء ومساعدة المستخدم.
 *
 * @param {object} client - عميل Telegraf المستخدم للتفاعل مع Telegram API.
 * @param {object} tableManager - كائن لإدارة العمليات على قاعدة البيانات.
 */
export function setupCommands(client, tableManager) {
    startCommand(client);
    helpCommand(client, tableManager);
    searchCommand(client);
    searchHadithCommand(client);
}