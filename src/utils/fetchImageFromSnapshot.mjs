import fetch from 'node-fetch';
import { logError } from './logger.mjs';

/**
 * وظيفة جلب صورة من خدمة HTML Snapshot.
 * @param {object} params - كائن يحتوي على جميع المتغيرات المطلوبة.
 * @param {string} params.htmlTemplate - قالب الـ HTML الذي سيتم تحويله إلى صورة.
 * @param {object} [params.data] - الكائن الذي يحتوي على المتغيرات ليتم دمجها في HTML (اختياري).
 * @returns {Promise<Buffer>} - Buffer للصورة المولدة.
 * @throws {Error} - في حال حدوث خطأ أثناء الطلب.
 */
export async function fetchImageFromSnapshot({ htmlTemplate, data = {} }) {
    try {
        // إعداد الطلب إلى خدمة HTML Snapshot
        const response = await fetch('https://htmlsnapshot.i8x.net/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                htmlTemplate: htmlTemplate, 
                data: data,
            }),
        });

        // تحقق من استجابة الطلب
        if (!response.ok) {
            throw new Error(`Error fetching image: ${response.statusText}`);
        }

        // جلب الصورة كـ base64
        const json = await response.json();

        if (!json.image) {
            throw new Error('Image not found in the response');
        }

        const imageBuffer = Buffer.from(json.image, 'base64');
        return imageBuffer;

    } catch (error) {
        console.error('Error fetching image:', error);
        logError('Error fetching image:', error);
        throw new Error('حدث خطأ أثناء جلب الصورة من الخدمة الخارجية');
    }
}