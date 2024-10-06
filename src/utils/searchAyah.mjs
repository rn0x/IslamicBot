import fetch from 'node-fetch';
import { logError } from './logger.mjs';

/**
 * البحث عن آية بناءً على كلمة.
 * @param {string} keyword - الكلمة المراد البحث عنها.
 * @returns {Promise<object[]>} - أول 5 آيات فريدة إذا تم العثور عليها.
 */
export async function searchAyah(keyword) {
    try {
        const response = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(keyword)}/all/ar`);

        if (!response.ok) {
            logError(`فشل في الحصول على البيانات: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();

        // التحقق من صحة البيانات وعدد الآيات
        if (data.code === 200 && Array.isArray(data.data.matches) && data.data.matches.length > 0) {
            // استخدام كائن لتخزين الآيات الفريدة
            const uniqueAyahs = {};

            for (const match of data.data.matches) {
                const ayahNumber = match.ayahNumber;
                const surahNumber = match.surah.number;

                // استخدام تركيبة رقم السورة ورقم الآية كـ مفتاح للتأكد من الفريدة
                const key = `${surahNumber}-${ayahNumber}`;

                // إضافة الآية فقط إذا لم تكن موجودة بالفعل
                if (!uniqueAyahs[key]) {
                    uniqueAyahs[key] = match; // احتفظ بالآية بالكامل
                }

                // إيقاف العملية إذا وصلنا إلى 5 آيات فريدة
                if (Object.keys(uniqueAyahs).length >= 5) break;
            }

            // تحويل الكائن إلى مصفوفة وإرجاعها
            return Object.values(uniqueAyahs);
        }

        return null;  // إذا لم توجد نتائج
    } catch (error) {
        logError('حدث خطأ أثناء البحث عن الآية:', error);
        throw new Error('تعذر العثور على الآية المطلوبة. يرجى المحاولة مرة أخرى.');
    }
}