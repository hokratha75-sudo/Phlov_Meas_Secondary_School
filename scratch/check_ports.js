const { execSync } = require('child_process');

const PORTS = [8080, 3000, 3001];

for (const port of PORTS) {
  try {
    const output = execSync(`netstat -ano`, { encoding: 'utf8' });
    const lines = output.split('\n').filter(l => l.includes(`:${port} `) && l.includes('LISTENING'));
    if (lines.length > 0) {
      console.log(`Port ${port} is active:`);
      for (const line of lines) {
        console.log('  ' + line.trim());
      }
    } else {
      console.log(`Port ${port} is free`);
    }
  } catch (err) {
    console.error(`Failed to check port ${port}:`, err.message);
  }
}
