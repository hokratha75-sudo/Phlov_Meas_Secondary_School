import jwt from "jsonwebtoken";

async function main() {
    const token = jwt.sign(
        { id: 1, username: "admin", role: "admin" },
        "your-super-secret-jwt-key-change-in-production",
        { expiresIn: "15m" }
    );
    console.log("Token generated:", token);

    const res = await fetch("http://localhost:8080/api/teachers/45464646/qr-code", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    console.log("Status:", res.status);
    console.log("Body:", await res.text());
}
main();
