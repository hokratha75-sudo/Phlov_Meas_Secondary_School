/**
 * kill-dev-ports.mjs
 * Automatically kills any process holding ports 8080, 3000, 3001
 * before the dev server starts. Runs via the "predev" npm script hook.
 */
import { execSync } from 'child_process';

const PORTS = [8080, 3000, 3001];

for (const port of PORTS) {
  try {
    const output = execSync(`netstat -ano`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const lines = output.split('\n').filter(l => l.includes(`:${port} `) && l.includes('LISTENING'));
    let killed = false;
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const procId = parts[parts.length - 1];
      if (procId && /^\d+$/.test(procId) && procId !== '0') {
        try {
          execSync(`taskkill /PID ${procId} /F`, { stdio: 'ignore' });
          console.log(`  ✔ Freed port ${port} (PID ${procId})`);
          killed = true;
        } catch { /* already gone */ }
      }
    }
    if (!killed) {
      console.log(`  ✔ Port ${port} is free`);
    }
  } catch { /* netstat failed - skip */ }
}
