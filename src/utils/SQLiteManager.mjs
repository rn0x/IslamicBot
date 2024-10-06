import Database from 'better-sqlite3';
import { logError, logInfo } from "./logger.mjs";

/**
 * SQLiteManager class for handling SQLite operations using better-sqlite3
 */
class SQLiteManager {
    /**
     * Initializes the database connection.
     * @param {string} dbPath - The file path of the SQLite database.
     */
    constructor(dbPath) {
        try {
            // this.db = new Database(dbPath, { verbose: console.log });
            this.db = new Database(dbPath);
            logInfo(`Database connected successfully at: ${dbPath}`);
        } catch (error) {
            logError(`Failed to connect to database: ${error.message}`);
        }
    }

    /**
   * Create a new table in the database with improved flexibility and error handling.
   * 
   * This method dynamically generates the table creation query based on the provided
   * columns and their types. Optionally, it supports creating the table only if it doesn't already exist.
   * 
   * @param {string} tableName - Name of the table to create.
   * @param {Object.<string, string>} columns - An object where the keys are column names and the values are their SQL data types.
   * @param {boolean} [ifNotExists=true] - If true, adds 'IF NOT EXISTS' to the creation query to avoid errors when the table already exists.
   * 
   * @example
   * // Create a users table with specified columns
   * dbManager.createTable('users', {
   *   id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
   *   user_id: 'INTEGER UNIQUE NOT NULL',
   *   username: 'TEXT',
   *   first_name: 'TEXT',
   *   last_name: 'TEXT',
   *   total_messages: 'INTEGER DEFAULT 0'
   * });
   * 
   * @example
   * // Create a groups table without 'IF NOT EXISTS'
   * dbManager.createTable('groups', {
   *   id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
   *   group_id: 'INTEGER UNIQUE NOT NULL',
   *   group_name: 'TEXT',
   *   total_messages: 'INTEGER DEFAULT 0'
   * }, false);
   */
    createTable(tableName, columns, ifNotExists = true) {
        try {
            // Generate the column definitions from the object
            const columnDefinitions = Object.entries(columns)
                .map(([colName, colDefinition]) => `${colName} ${colDefinition}`)
                .join(', ');

            // Create the final SQL query
            const createTableQuery = `CREATE TABLE ${ifNotExists ? 'IF NOT EXISTS' : ''} ${tableName} (${columnDefinitions})`;

            // Execute the query
            this.db.prepare(createTableQuery).run();

            // logInfo(`Table '${tableName}' created successfully.`);
        } catch (error) {
            logError(`Failed to create table '${tableName}': ${error.message}`);
        }
    }

    /**
     * Insert data into a table.
     * @param {string} tableName - Name of the table to insert into.
     * @param {Object} data - Data object with column names as keys and values as values.
     * @returns {number} - The ID of the inserted row.
     */
    insertData(tableName, data) {
        try {
            const columns = Object.keys(data).join(", ");
            const placeholders = Object.keys(data).map(() => '?').join(", ");
            const insertQuery = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
            const statement = this.db.prepare(insertQuery);
            const result = statement.run(...Object.values(data));
            // logInfo(`Data inserted into '${tableName}' with row ID: ${result.lastInsertRowid}`);
            return result.lastInsertRowid;
        } catch (error) {
            logError(`Failed to insert data into '${tableName}': ${error.message}`);
            return null;
        }
    }

    /**
     * Update data in a table.
     * @param {string} tableName - Name of the table to update.
     * @param {Object} data - Data object with column names and values to update.
     * @param {Object} whereClause - Object with conditions for the WHERE clause.
     */
    updateData(tableName, data, whereClause) {
        try {
            const updates = Object.keys(data).map(col => `${col} = ?`).join(", ");
            const conditions = Object.keys(whereClause).map(col => `${col} = ?`).join(" AND ");
            const updateQuery = `UPDATE ${tableName} SET ${updates} WHERE ${conditions}`;
            const statement = this.db.prepare(updateQuery);
            const result = statement.run(...Object.values(data), ...Object.values(whereClause));
            // logInfo(`Updated ${result.changes} row(s) in '${tableName}'`);
        } catch (error) {
            logError(`Failed to update data in '${tableName}': ${error.message}`);
        }
    }

    /**
     * Delete data from a table.
     * @param {string} tableName - Name of the table to delete from.
     * @param {Object} whereClause - Object with conditions for the WHERE clause.
     */
    deleteData(tableName, whereClause) {
        try {
            const conditions = Object.keys(whereClause).map(col => `${col} = ?`).join(" AND ");
            const deleteQuery = `DELETE FROM ${tableName} WHERE ${conditions}`;
            const statement = this.db.prepare(deleteQuery);
            const result = statement.run(...Object.values(whereClause));
            // logInfo(`Deleted ${result.changes} row(s) from '${tableName}'`);
        } catch (error) {
            logError(`Failed to delete data from '${tableName}': ${error.message}`);
        }
    }

    /**
     * Fetch data from a table.
     * @param {string} tableName - Name of the table to fetch data from.
     * @param {string[]} columns - Array of column names to fetch (e.g., ['id', 'name']).
     * @param {Object} [whereClause] - Optional conditions for the WHERE clause.
     * @returns {Object[]} - Array of fetched rows.
     */
    fetchData(tableName, columns, whereClause = {}) {
        try {
            const cols = columns.join(", ");
            const conditions = Object.keys(whereClause).map(col => `${col} = ?`).join(" AND ");
            const selectQuery = conditions ?
                `SELECT ${cols} FROM ${tableName} WHERE ${conditions}` :
                `SELECT ${cols} FROM ${tableName}`;

            const statement = this.db.prepare(selectQuery);
            const rows = conditions ?
                statement.all(...Object.values(whereClause)) :
                statement.all();
            // logInfo(`Fetched ${rows.length} row(s) from '${tableName}'`);
            return rows;
        } catch (error) {
            logError(`Failed to fetch data from '${tableName}': ${error.message}`);
            return [];
        }
    }

    /**
    * Get the count of records in a given table with an optional condition.
    * @param {string} tableName - The name of the table to count records from.
    * @param {string} [condition] - Optional condition for the count query.
    * @returns {Promise<number>} - The count of records.
    */
    getCount(tableName, condition) {
        try {
            const query = condition ?
                `SELECT COUNT(*) AS count FROM ${tableName} WHERE ${condition}` :
                `SELECT COUNT(*) AS count FROM ${tableName}`;
            const statement = this.db.prepare(query);
            const result = statement.get(); // استخدم get() بدلاً من run() لجلب البيانات
            return result.count || 0; // إرجاع العدد، إذا لم يكن موجودًا فالإرجاع 0
        } catch (error) {
            logError(`Failed to get count from '${tableName}': ${error.message}`);
            return 0; // إرجاع 0 في حال حدوث خطأ
        }
    }

    /**
     * Close the database connection.
     */
    close() {
        try {
            this.db.close();
            logInfo("Database connection closed.");
        } catch (error) {
            logError(`Failed to close the database: ${error.message}`);
        }
    }
}

export default SQLiteManager;