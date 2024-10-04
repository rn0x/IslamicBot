import { Scenes } from 'telegraf';

const addressScene = new Scenes.BaseScene('addressScene');

addressScene.enter((ctx) => {
    ctx.reply('Please enter your address:');
});

addressScene.on('text', (ctx) => {
    ctx.session.address = ctx.message.text; // تخزين العنوان
    ctx.reply(`Your address is: ${ctx.session.address}`);
    ctx.scene.enter('phoneScene'); // الانتقال إلى المرحلة التالية
});

export default addressScene;
