const db = require("./db");

async function run() {
    try {
        console.log("Adding permissions column to users table...");
        try {
            await db.query(`ALTER TABLE users ADD COLUMN permissions JSON NULL`);
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("permissions column already exists.");
            } else {
                throw e;
            }
        }
        
        // Update existing users
        const defaultOrgPerms = JSON.stringify({ createHost: true, editShared: true, viewLogs: true, startSessions: true });
        const defaultTeamPerms = JSON.stringify({ createHost: false, editShared: false, viewLogs: false, startSessions: true });
        
        await db.query(`UPDATE users SET permissions = ? WHERE role IN ('organization_user', 'owner') AND permissions IS NULL`, [defaultOrgPerms]);
        await db.query(`UPDATE users SET permissions = ? WHERE role = 'team_mate' AND permissions IS NULL`, [defaultTeamPerms]);

        console.log("Permissions migration successful!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}
run();
