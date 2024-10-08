import { logError } from "./logger.mjs";

/**
 * إرسال رسالة مقسمة إلى أجزاء صغيرة مع معالجة الأخطاء.
 * @param {object} ctx - السياق الخاص بالبوت.
 * @param {string} text - النص المراد إرساله.
 * @param {object} [options] - خيارات إضافية مثل معرف الرسالة للرد عليها (اختياري).
 */
export default async function sendMessageInChunks(ctx, text, options = {}) {
    const maxLength = 4096; // الحد الأقصى لطول الرسالة في تيليجرام
    const chunks = [];

    // تقسيم النص إلى أجزاء صغيرة
    for (let i = 0; i < text.length; i += maxLength) {
        chunks.push(text.slice(i, i + maxLength));
    }

    // إرسال كل جزء من الرسالة
    for (const chunk of chunks) {
        try {
            await ctx.reply(chunk, { parse_mode: 'Markdown', ...options });
        } catch (error) {
            logError('Error sending message chunk:', error);
            // إبلاغ المستخدم بخطأ في إرسال الرسالة
            await ctx.reply(`حدث خطأ أثناء محاولة إرسال الرسالة: ${error.message}`, { parse_mode: 'Markdown', ...options });
            break; // الخروج من الحلقة في حال حدوث خطأ
        }
    }
}