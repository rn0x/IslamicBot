import SQLiteSessionManager from '../utils/SQLiteSessionManager.mjs'
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbSessionPath = path.join(__dirname, '../../session.db');
const sessionManager = new SQLiteSessionManager(dbSessionPath);
export default function sqliteSessionMiddleware() {
    return (ctx, next) => {
        const sessionKey = `${ctx.chat.id}:${ctx.from.id}`; 
        ctx.session = sessionManager.get(sessionKey) || {};
        return next().then(() => {
            sessionManager.set(sessionKey, ctx.session);
        });
    };
};

process.on('SIGINT', () => {
    sessionManager.dbManager.close();
});