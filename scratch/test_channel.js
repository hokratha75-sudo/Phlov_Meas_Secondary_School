const TelegramBot = require('node-telegram-bot-api');
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

const bot = new TelegramBot(token);

async function main() {
  try {
    const res = await bot.sendMessage(channelId, 'Test message from server script');
    console.log('Success!', res);
  } catch (err) {
    console.error('Error sending message:', err);
  }
}

main().catch(console.error);
