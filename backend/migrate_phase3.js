const db = require("./db");

async function run() {
    try {
        console.log("Migrating activity_logs table to hold explicit sessionId...");
        try {
            await db.query(`ALTER TABLE activity_logs ADD COLUMN sessionId varchar(36) DEFAULT NULL`);
            // Optionally we can index it for fast retrieval
            await db.query(`ALTER TABLE activity_logs ADD INDEX (sessionId)`);
            console.log("Column and index successfully added.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("sessionId already exists.");
            else throw e;
        }

        console.log("Phase 3 Migration successful!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}
run();
