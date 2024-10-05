import SQLiteManager from './SQLiteManager.mjs';

/**
 * TableManager class for creating and managing tables in the database.
 */
class TableManager {
    constructor(dbPath) {
        this.dbManager = new SQLiteManager(dbPath);
        this.initializeTables();
    }

    /**
     * Initialize and create the necessary tables.
     */
    initializeTables() {
        // Create users table
        this.dbManager.createTable('users', {
            id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
            user_id: 'INTEGER UNIQUE NOT NULL',
            username: 'TEXT',
            first_name: 'TEXT',
            last_name: 'TEXT',
            is_bot: 'BOOLEAN DEFAULT 0',  // يحدد إذا كان المستخدم بوت
            created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP', // تاريخ الإنشاء
        });

        // Create chats table (this can represent groups, channels, or private chats)
        this.dbManager.createTable('chats', {
            id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
            chat_id: 'INTEGER UNIQUE NOT NULL',
            chat_title: 'TEXT',
            chat_username: 'TEXT',
            chat_type: "TEXT DEFAULT 'private'",  // نوع الدردشة (private, group, supergroup, channel)
            scheduled_enabled: 'BOOLEAN DEFAULT 1',  // هل الرسائل المجدولة مفعلة لهذه المحادثة
            scheduled_categories: "TEXT DEFAULT '[\"all\"]'",  // فئات الرسائل المجدولة على شكل JSON
            status: "TEXT DEFAULT 'active'", // حالة المحداثه (active, kicked, left)
            created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP' // تاريخ الإنشاء
        });

        // Create messages table
        // this.dbManager.createTable('messages', {
        //     id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        //     message_id: 'INTEGER NOT NULL',
        //     chat_id: 'INTEGER NOT NULL', // هذا يمكن أن يكون من دردشة (قروب/خاص)
        //     user_id: 'INTEGER NOT NULL', // الشخص الذي أرسل الرسالة
        //     content: 'TEXT', // محتوى الرسالة
        //     sent_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP' // وقت إرسال الرسالة
        // });

        // Create chat_members table for storing which users are in which chats (many-to-many relationship)
        this.dbManager.createTable('chat_members', {
            id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
            chat_id: 'INTEGER NOT NULL', // الدردشة التي ينتمي إليها العضو
            user_id: 'INTEGER NOT NULL', // العضو الذي ينتمي للدردشة
            role: "TEXT DEFAULT 'member'" // صلاحيات العضو: admin, member, restricted
        });
        console.log("All tables initialized successfully.");
    }
}

export default TableManager;