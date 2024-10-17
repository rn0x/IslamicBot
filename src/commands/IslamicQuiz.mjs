import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export default function IslamicQuiz(client) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const IslamicQuizPath = path.join(__dirname, '../data/IslamicQuiz.json');

    // تحميل بيانات JSON
    const loadData = async () => {
        try {
            const data = await fs.readJson(IslamicQuizPath);
            return data;
        } catch (error) {
            console.error('Failed to load JSON data:', error);
            throw new Error('Error loading data');
        }
    };

    // دالة لاختيار عدد معين من الأسئلة عشوائيًا
    const getRandomQuestions = (questions, count) => {
        return questions.sort(() => Math.random() - 0.5).slice(0, count);
    };

    // دالة لترتيب الإجابات بشكل عشوائي
    const shuffleAnswers = (answers) => {
        return answers.sort(() => Math.random() - 0.5);
    };

    // دالة لاختصار النص إذا كان طوله أكبر من 100 حرف
    const truncateText = (text, maxLength = 100) => {
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    client.command('quiz', async (ctx) => {
        try {
            const data = await loadData();
            const tafseerQuestions = data.mainCategories.find(cat => cat.arabicName === 'التفسير').topics[0].levelsData.level1;

            // اختيار سؤال عشوائي من القسم المطلوب
            const randomQuestions = getRandomQuestions(tafseerQuestions, 1);
            const question = randomQuestions[0];

            // ترتيب الإجابات بشكل عشوائي
            const shuffledAnswers = shuffleAnswers(question.answers);

            // العثور على الإجابة الصحيحة بعد الترتيب
            const correctOptionId = shuffledAnswers.findIndex(ans => ans.t === 1);

            // تجهيز النص المختصر للإجابة الصحيحة
            const explanation = truncateText(`الإجابة الصحيحة هي ✔️: \n${shuffledAnswers[correctOptionId].answer}`);

            // إرسال الاستطلاع عبر Telegraf
            await ctx.replyWithPoll(
                question.q,
                shuffledAnswers.map(ans => ans.answer),
                {
                    is_anonymous: true,
                    allows_multiple_answers: false,
                    correct_option_id: correctOptionId,
                    type: 'quiz',
                    explanation: explanation,
                }
            );
        } catch (error) {
            console.error('Failed to send quiz:', error);
            await ctx.reply('حدث خطأ أثناء محاولة إرسال السؤال 😞');
        }
    });
}
