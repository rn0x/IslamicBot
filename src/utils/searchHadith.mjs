import Fuse from 'fuse.js';
import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import removeDiacritics from './removeDiacritics.mjs';
import { logError } from './logger.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// خيارات Fuse.js
const fuseOptions = {
    keys: ['textArabic', 'textEnglish'], // الحقول التي سيتم البحث فيها
    threshold: 0.3, // درجة الغموض في البحث (قيمة أقل = أكثر دقة)
    distance: 100, // مسافة البحث الغامض
    ignoreLocation: true, // تجاهل موقع الكلمة في النص
    tokenize: true, // تقسيم النص إلى كلمات
    minMatchCharLength: 2, // الحد الأدنى لأحرف المطابقة
};

const hadithCache = {};

const hadithSources = ['bukhari', 'muslim', 'abudawud'];
for (const source of hadithSources) {
    try {
        const filePath = path.join(__dirname, `../data/hadith/${source}.json`);
        const data = await fs.readJSON(filePath);
        hadithCache[source] = data;
    } catch (error) {
        logError(`خطأ في تحميل بيانات ${source}:`, error);
    }
}

console.log("تم تحميل البينات");



// دالة البحث في الأحاديث
export async function searchHadith(query, source) {
    const data = hadithCache[source];
    const fuse = new Fuse(
        data.hadiths.map((hadith, id) => ({
            id,
            metadata: data.metadata,
            idInBook: hadith.idInBook,
            chapterId: hadith.chapterId,
            bookId: hadith.bookId,
            narrator: hadith.english.narrator,
            textArabic: removeDiacritics(hadith.arabic || ""), // إزالة التشكيل
            textEnglish: hadith.english.text || "", // النص الإنجليزي كما هو
        })),
        fuseOptions
    );

    if (!fuse) {
        logError("يجب تحميل البيانات أولاً.");
        return [];
    }

    // إزالة التشكيل من الاستعلام لتطابق أفضل مع النصوص
    const searchTerm = removeDiacritics(query);

    // تنفيذ البحث باستخدام Fuse.js
    const results = fuse.search(searchTerm);

    if (results.length === 0) {
        return [];
    }

    // إرجاع النتائج
    return results.map(result => result.item);
}