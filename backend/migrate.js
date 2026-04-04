const db = require("./db");

async function run() {
    try {
        console.log("Creating organizations table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS organizations (
                id varchar(36) PRIMARY KEY,
                name varchar(255) NOT NULL,
                ownerId varchar(36) NOT NULL
            );
        `);
        console.log("Adding organizationId to users table...");
        try {
            await db.query(`ALTER TABLE users ADD COLUMN organizationId varchar(36) NULL`);
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("organizationId already exists.");
            } else {
                throw e;
            }
        }
        console.log("Migration successful!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}
run();
