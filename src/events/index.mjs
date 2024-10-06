import { setupTextEvents } from './textEvents.mjs';

/**
 * إعداد جميع الأحداث الخاصة بالبوت
 * @param {object} client - عميل Telegraf.
 */
export function setupEvents(client) {
    setupTextEvents(client); 
}