import { Scenes } from 'telegraf';
import nameScene from './nameScene.mjs';
import addressScene from './addressScene.mjs';
import phoneScene from './phoneScene.mjs';

// تجميع جميع المشاهد
const stage = new Scenes.Stage([nameScene, addressScene, phoneScene]);

export default stage;
