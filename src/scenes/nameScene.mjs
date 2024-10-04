import { Scenes } from 'telegraf';

const nameScene = new Scenes.BaseScene('nameScene');

nameScene.enter((ctx) => {
    ctx.reply('Please enter your name:');
});

nameScene.on('text', (ctx) => {
    ctx.session.name = ctx.message.text; // تخزين الاسم
    ctx.reply(`Your name is: ${ctx.session.name}`);
    ctx.scene.enter('addressScene'); // الانتقال إلى المرحلة التالية
});

export default nameScene;