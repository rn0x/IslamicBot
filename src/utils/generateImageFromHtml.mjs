import nodeHtmlToImage from 'node-html-to-image';
import dotenv from 'dotenv';
import { logError } from './logger.mjs';
dotenv.config();

/**
 * وظيفة توليد صورة من HTML باستخدام node-html-to-image مع خيارات Puppeteer مخصصة.
 * @param {object} params - كائن يحتوي على جميع المتغيرات المطلوبة.
 * @param {string} params.htmlTemplate - قالب الـ HTML الذي سيتم تحويله إلى صورة.
 * @param {object} [params.data] - الكائن الذي يحتوي على المتغيرات ليتم دمجها في HTML (اختياري).
 * @param {string} [params.output] - مسار حفظ الصورة المنتجة (اختياري).
 * @param {object} [params.options] - خيارات إضافية للتحكم بالصورة (اختياري).
 * @returns {Promise<Buffer|string>} - إما Buffer للصورة أو المسار إلى الصورة المحفوظة.
 * @throws {Error} - في حال حدوث خطأ أثناء التوليد.
 */
export async function generateImageFromHtml({ htmlTemplate, data = {}, output = null, options = {} }) {
    try {
        // جلب مسار المتصفح من ملف .env
        const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome';

        // إعدادات Puppeteer الافتراضية لتحسين الأداء
        const puppeteerArgs = {
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-cache',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--disable-extensions',
                '--headless',
            ],
            executablePath,
            headless: "new", // new or false
        };

        // إذا كان الكائن `data` فارغًا، نستخدم القالب كما هو دون استبدال المتغيرات
        const html = Object.keys(data).length > 0
            ? Object.keys(data).reduce((acc, key) => {
                return acc.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
            }, htmlTemplate)
            : htmlTemplate;

        // الخيارات الافتراضية لتحسين السرعة والأداء
        const defaultOptions = {
            type: 'png',
            quality: 80,
            encoding: 'buffer',
            timeout: 10000,
            puppeteerArgs,
        };

        const finalOptions = {
            html,
            ...defaultOptions,
            ...options,
            output: output || undefined,
        };

        // توليد الصورة باستخدام node-html-to-image
        const image = await nodeHtmlToImage(finalOptions);

        return image;
    } catch (error) {
        logError('Error generating image:', error);
        throw new Error('حدث خطأ أثناء توليد الصورة');
    }
}