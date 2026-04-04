const db = require("./db");

async function run() {
    try {
        console.log("Migrating users table `isActive`...");
        try {
            await db.query(`ALTER TABLE users ADD COLUMN isActive BOOLEAN DEFAULT TRUE`);
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("isActive already exists.");
            else throw e;
        }

        console.log("Creating team_groups table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS team_groups (
                id varchar(36) PRIMARY KEY,
                name varchar(255) NOT NULL,
                organizationId varchar(36) NOT NULL
            );
        `);

        console.log("Creating team_group_members table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS team_group_members (
                groupId varchar(36) NOT NULL,
                userId varchar(36) NOT NULL,
                PRIMARY KEY (groupId, userId)
            );
        `);

        console.log("Creating team_group_hosts table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS team_group_hosts (
                groupId varchar(36) NOT NULL,
                hostId varchar(36) NOT NULL,
                PRIMARY KEY (groupId, hostId)
            );
        `);

        console.log("Creating active_sessions table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS active_sessions (
                id varchar(36) PRIMARY KEY,
                userId varchar(36) NOT NULL,
                hostId varchar(36) NOT NULL,
                status varchar(50) DEFAULT 'active',
                startedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                lastActive TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Creating activity_logs table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id varchar(36) PRIMARY KEY,
                userId varchar(36) NOT NULL,
                action varchar(100) NOT NULL,
                details TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Phase 2 Migration successful!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}
run();
