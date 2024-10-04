import { Scenes } from 'telegraf';

const phoneScene = new Scenes.BaseScene('phoneScene');

phoneScene.enter((ctx) => {
    ctx.reply('Please enter your phone number:');
});

phoneScene.on('text', (ctx) => {
    ctx.session.phone = ctx.message.text; // تخزين رقم الهاتف
    ctx.reply(`Your phone number is: ${ctx.session.phone}`);
    ctx.reply('Thank you! Your information has been collected.');
    ctx.scene.leave(); // إنهاء المشهد
});

export default phoneScene;
