import { htmlToText } from 'html-to-text';

/**
 * إزالة وسوم HTML وتحويل النص إلى نص خام.
 * @param {string} htmlText - النص الذي يحتوي على HTML.
 * @returns {string} - النص الخام بدون HTML.
 */
export default function convertHtmlToText(htmlText) {
    return htmlToText(htmlText, {
        wordwrap: 130, // إعداد التفاف النص
        selectors: [
            { selector: 'a', format: 'inline' }, // تعامل مع الروابط
            { selector: 'img', format: 'skip' }, // تجاهل الصور
        ],
    });
}