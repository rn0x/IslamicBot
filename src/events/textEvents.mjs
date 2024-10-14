import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { processAyahSearch } from '../utils/processAyahSearch.mjs';
import processHadithSearch from '../utils/processHadithSearch.mjs';
import processFatwaSearch from '../utils/processFatwaSearch.mjs';
import processKhutbahSearch from '../utils/processKhutbahSearch.mjs';

export async function setupTextEvents(ctx) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // استجابة لحدث النص (عندما يرسل المستخدم كلمة)

    await processAyahSearch(ctx); // استدعاء دالة معالجة البحث عن آية
    await processHadithSearch(ctx); // استدعاء دالة معالجة البحث عن حديث
    await processFatwaSearch(ctx); // استدعاء دالة معالجة البحث عن فتوى
    await processKhutbahSearch(ctx); // استدعاء دالة معالجة البحث عن خطبة
}