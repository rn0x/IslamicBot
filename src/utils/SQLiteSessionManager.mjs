import SQLiteManager from './SQLiteManager.mjs';

/**
 * SQLiteSessionManager for handling session storage.
 */
class SQLiteSessionManager {
    constructor(dbPath) {
        this.dbManager = new SQLiteManager(dbPath);
        this.createSessionTable();
    }

    /**
     * Create a session table if it doesn't exist.
     */
    createSessionTable() {
        this.dbManager.createTable('sessions', {
            key: 'TEXT PRIMARY KEY', // Unique session key
            data: 'TEXT' // Session data stored as a JSON string
        });
    }

    /**
     * Get session data by key.
     * @param {string} key - Session key (usually user_id or chat_id).
     * @returns {Object|null} - Session data or null if not found.
     */
    get(key) {
        const result = this.dbManager.fetchData('sessions', ['data'], { key });
        return result.length > 0 ? JSON.parse(result[0].data) : null;
    }

    /**
     * Save or update session data.
     * @param {string} key - Session key (usually user_id or chat_id).
     * @param {Object} value - Session data to store.
     */
    set(key, value) {
        const existingSession = this.get(key);
        const data = JSON.stringify(value);
        if (existingSession) {
            // Update session data
            this.dbManager.updateData('sessions', { data }, { key });
        } else {
            // Insert new session data
            this.dbManager.insertData('sessions', { key, data });
        }
    }

    /**
     * Delete session by key.
     * @param {string} key - Session key to delete.
     */
    delete(key) {
        this.dbManager.deleteData('sessions', { key });
    }
}

export default SQLiteSessionManager;