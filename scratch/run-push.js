const { spawn } = require("child_process");
const path = require("path");

console.log("Starting drizzle-kit push...");

const child = spawn("npx", ["drizzle-kit", "push", "--config", "./drizzle.config.ts"], {
  cwd: path.resolve(__dirname, "..", "lib", "db"),
  shell: true,
});

child.stdout.on("data", (data) => {
  const output = data.toString();
  process.stdout.write(output);
  
  // Look for prompt indicator
  if (output.includes("❯") || output.includes("yes/no") || output.includes("?") || output.includes("Do you want to")) {
    console.log("\n[Script] Prompt detected, sending carriage return + enter...");
    child.stdin.write("\r\n");
  }
});

child.stderr.on("data", (data) => {
  process.stderr.write(data.toString());
});

child.on("close", (code) => {
  console.log(`\nDrizzle-kit push exited with code ${code}`);
  process.exit(code || 0);
});
