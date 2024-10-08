import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setupLanguageActions } from './languageActions.mjs';
import { setupReciterActions } from './reciterActions.mjs';
import { tafseerActions } from './tafseerActions.mjs'

/**
 * إعداد جميع الأكشن الخاصة بالبوت
 * @param {object} client - عميل Telegraf.
 */
export function setupActions(client) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const tafseerMouaser = fs.readJSONSync(path.join(__dirname, '../data/tafseerMouaser.json'));
    setupLanguageActions(client);   // إعداد أحداث اختيار اللغة
    setupReciterActions(client);    // إعداد أحداث اختيار القارئ
    tafseerActions(client, tafseerMouaser); // زر التفسير الميسر
}