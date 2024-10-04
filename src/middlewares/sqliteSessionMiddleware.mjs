import SQLiteSessionManager from '../utils/SQLiteSessionManager.mjs'

const sessionManager = new SQLiteSessionManager('./session.db');
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