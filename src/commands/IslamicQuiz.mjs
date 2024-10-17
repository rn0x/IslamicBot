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

    // دالة لاختيار عنصر عشوائي من مصفوفة
    const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

    // دالة لاختيار عدد معين من الأسئلة عشوائيًا
    const getRandomQuestions = (questions, count) =>
        questions.sort(() => Math.random() - 0.5).slice(0, count);

    // دالة لترتيب الإجابات بشكل عشوائي
    const shuffleAnswers = (answers) =>
        answers.sort(() => Math.random() - 0.5);

    // دالة لاختصار النص إذا كان طوله أكبر من 100 حرف
    const truncateText = (text, maxLength = 100) =>
        text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

    client.command('quiz', async (ctx) => {
        try {
            const data = await loadData();

            const randomCategory = getRandomElement(data.mainCategories);
            const randomTopic = getRandomElement(randomCategory.topics);
            const levels = Object.keys(randomTopic.levelsData);
            const randomLevel = getRandomElement(levels);

            const questions = randomTopic.levelsData[randomLevel];
            const [question] = getRandomQuestions(questions, 1);

            const shuffledAnswers = shuffleAnswers(question.answers);

            const truncatedAnswers = shuffledAnswers.map(ans =>
                truncateText(ans.answer, 100) // اختصار كل إجابة لتكون أقل من 100 حرف
            );

            const correctOptionId = shuffledAnswers.findIndex(ans => ans.t === 1);

            const explanation = truncateText(
                `الإجابة الصحيحة هي ✔️: \n${shuffledAnswers[correctOptionId].answer}`
            );

            await ctx.replyWithPoll(
                question.q,
                truncatedAnswers,
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
