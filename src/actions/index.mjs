import { setupLanguageActions } from './languageActions.mjs';
import { setupReciterActions } from './reciterActions.mjs';

/**
 * إعداد جميع الأكشن الخاصة بالبوت
 * @param {object} client - عميل Telegraf.
 */
export function setupActions(client) {
    setupLanguageActions(client);   // إعداد أحداث اختيار اللغة
    setupReciterActions(client);    // إعداد أحداث اختيار القارئ
}