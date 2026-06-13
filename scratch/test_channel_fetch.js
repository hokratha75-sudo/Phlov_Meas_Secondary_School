const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

let token = '';
let channelId = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('TELEGRAM_BOT_TOKEN=')) {
    token = line.split('=')[1].trim();
  }
  if (line.startsWith('TELEGRAM_TEACHERS_CHANNEL_ID=')) {
    channelId = line.split('=')[1].trim();
  }
}

console.log('Token:', token);
console.log('Channel ID:', channelId);

async function main() {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        text: 'Test message from server script (fetch)',
        parse_mode: 'HTML'
      })
    });
    const result = await response.json();
    console.log('Result:', result);
  } catch (err) {
    console.error('Error sending message:', err);
  }
}

main().catch(console.error);
