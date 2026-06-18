import { eq } from 'drizzle-orm';
import { db, adminUsers } from './lib/db/dist/index.mjs';
import { generateTokens } from './artifacts/api-server/dist/utils/securityFunctions.mjs';
import fetch from 'node-fetch';

async function main() {
    try {
        // Generate an admin token
        const admins = await db.select().from(adminUsers).limit(1);
        if (!admins[0]) throw new Error("No admin user found");
        
        const { accessToken } = generateTokens({
            id: admins[0].id,
            username: admins[0].username,
            role: "admin",
        });

        console.log("Token generated:", accessToken);

        // Call the API endpoint
        const res = await fetch('http://localhost:8080/api/teachers/4/qr-code', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        const body = await res.text();
        console.log("Status:", res.status);
        console.log("Body:", body);
    } catch (err) {
        console.error("Error:", err);
    }
}
main();
