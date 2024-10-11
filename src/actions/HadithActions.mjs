import { fetchImageFromSnapshot } from '../utils/fetchImageFromSnapshot.mjs';
import { Markup } from 'telegraf';
import fetch from 'node-fetch';
import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logError } from '../utils/logger.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function HadithActions(client) {
    // التعامل مع النمط get_hadith_api
    client.action(/get_hadith_api/, async (ctx) => {
        const usernameBot = ctx?.botInfo?.username;
        const hadithId = extractId(ctx.callbackQuery.data, 'get_hadith_api');
        if (hadithId) {
            const data = await fetchHadithFromAPI(hadithId);
            if (data) {
                await handleHadithImage(ctx, data.data[0], usernameBot, true);
            } else {
                await ctx.reply('لايوجد بيانات يتم جلبها من API [alminasa.ai]');
            }
        }
    });

    // التعامل مع النمط get_hadith
    client.action(/get_hadith:(\w+):(\d+)/, async (ctx) => {
        const usernameBot = ctx?.botInfo?.username;
        const matches = ctx.callbackQuery.data.match(/get_hadith:(\w+):(\d+)/);
        if (matches) {
            const [source, hadithId] = [matches[1], parseInt(matches[2])];
            const hadith = await fetchHadithFromFile(source, hadithId);
            if (hadith) {
                await handleHadithImage(ctx, hadith, usernameBot, false);
            } else {
                await ctx.reply('لم يتم العثور على الحديث المطلوب.');
            }
        }
    });
}

// دالة مساعدة لجلب الحديث من API
async function fetchHadithFromAPI(hadithId) {
    try {
        const response = await fetch(`https://alminasa.ai/api/semantic-hadith?id=${hadithId}`);
        const data = await response.json();
        return data.data && data.data.length > 0 ? data : null;
    } catch (error) {
        logError('Error fetching hadith from API:', error);
        return null;
    }
}

// دالة مساعدة لجلب الحديث من ملف JSON
async function fetchHadithFromFile(source, hadithId) {
    const filePath = path.join(__dirname, `../data/hadith/${source}.json`);
    try {
        const data = await fs.readJSON(filePath);
        const hadithData = data.hadiths.find(h => h.id === hadithId);

        return {
            metadata: data.metadata,
            chapter: data.chapters.find(c => c.id === hadithData.chapterId),
            hadith: hadithData
        };
    } catch (error) {
        logError('Error reading hadith data:', error);
        return null;
    }
}

// دالة مساعدة لاستخراج ID من callback data
function extractId(callbackData, prefix) {
    return callbackData.split(`${prefix}:`).join("");
}

// وظيفة مساعدة لتحويل الحديث إلى صورة وإرسالها
async function handleHadithImage(ctx, data, usernameBot, useApi) {
    const htmlTemplate = generateHtmlTemplate(useApi);
    const htmlData = generateHtmlData(data, usernameBot, useApi);

    // تحقق إذا كان القالب غير معرّف أو فارغ
    if (!htmlTemplate || htmlTemplate.trim() === '') {
        logError('قالب HTML غير صالح أو مفقود');
        await ctx.reply('حدث خطأ أثناء تحويل الحديث إلى صورة: قالب HTML غير صالح.');
        return;  // الخروج من الدالة
    }

    try {

        const base64Image = await fetchImageFromSnapshot({
            htmlTemplate,
            data: htmlData
        });

        // إزالة الترويسة (prefix) إذا كانت موجودة
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

        // تحويل Base64 إلى Buffer
        const imageBuffer = Buffer.from(base64Data, 'base64');

        await ctx.replyWithPhoto({ source: imageBuffer }, { caption: `` });
    } catch (error) {
        logError('Error while generating image:', error);
        await ctx.reply('حدث خطأ أثناء تحويل الحديث إلى صورة.');
    }
}

// دالة مساعدة لتوليد HTML Template
function generateHtmlTemplate(useApi) {
    const fileName = useApi ? 'hadithFromApiTemplate.html' : 'hadithLocalTemplate.html';
    const filePath = path.join(__dirname, '../template', fileName);

    try {
        // قراءة الملف باستخدام fs.readFileSync
        const htmlTemplate = fs.readFileSync(filePath, 'utf8');
        return htmlTemplate;
    } catch (err) {
        logError(`خطأ أثناء قراءة ملف القالب: ${fileName}`, err);
        // يمكنك اختيار إعادة قالب افتراضي في حال حدوث خطأ
        return undefined
    }
}

// دالة مساعدة لتوليد HTML Data
function generateHtmlData(data, usernameBot, useApi) {
    const botName = process.env.BOT_NAME || 'البوت';

    // const fontPath = path.join(__dirname, "../template/fonts/Rubik-Regular.ttf");
    // const font_rubik = fs.readFileSync(fontPath);
    // const font_rubik_base64 = font_rubik.toString('base64'); // تحويل الخط إلى Base64
    // const font_rubik_uri = `data:font/truetype;base64,${font_rubik_base64}`; // إنشاء Data URI

    if (useApi) {
        return {
            name_bot: botName,
            username_bot: usernameBot,
            book: data.hadith_book_name || '',
            text: data.hadith || '',
            chapter: data.chapter,
            page: data.page,
            volume: data.volume,
            narrators: data.narrators.map(n => `${n.full_name} (${n.is_companion ? 'صحابي' : 'غير صحابي'})`).join(', '),
        };
    } else {
        return {
            name_bot: botName,
            username_bot: usernameBot,
            author: data.metadata.arabic.author,
            book: data.metadata.arabic.title,
            chapter: data.chapter.arabic,
            textArabic: data.hadith.arabic,
            textEnglish: `${data.hadith.english.narrator} ${data.hadith.english.text}`
        };
    }
}
