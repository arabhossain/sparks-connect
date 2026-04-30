const db = require("./db");

async function run() {
    try {
        console.log("Creating vaults table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS vaults (
                id varchar(36) PRIMARY KEY,
                org_id varchar(36) NOT NULL,
                name varchar(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Creating vault_items table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS vault_items (
                id varchar(36) PRIMARY KEY,
                vault_id varchar(36) NOT NULL,
                type ENUM('host','key','snippet','secret') NOT NULL,
                encrypted_data TEXT NOT NULL,
                iv VARCHAR(255) NOT NULL,
                tag VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE
            );
        `);

        console.log("Migration successful!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}
run();
