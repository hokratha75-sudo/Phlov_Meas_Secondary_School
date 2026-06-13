import fs from 'fs';
import pg from 'pg';

const DB_URL = 'postgresql://postgres:@localhost:5432/highschool_hub';

async function main() {
    const client = new pg.Client({ connectionString: DB_URL });
    try {
        await client.connect();
        console.log("Connected to highschool_hub database");
        const sql = fs.readFileSync('scripts/db-tuning/0003_scheduling_system.sql', 'utf8');
        await client.query(sql);
        console.log("SQL Executed Successfully");
    } catch (error) {
        console.error("Error executing SQL:", error);
    } finally {
        await client.end();
    }
}
main();
