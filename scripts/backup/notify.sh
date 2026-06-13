#!/bin/bash
# ---------------------------------------------------------
# Phlov Meas Secondary School - Telegram Notification Script
# ---------------------------------------------------------

# Load environment variables if `.env` exists in the backup directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [ -f "$DIR/.env" ]; then
    source "$DIR/.env"
fi

TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN:-"YOUR_BOT_TOKEN_HERE"}
TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID:-"YOUR_CHAT_ID_HERE"}

# Usage: ./notify.sh "MESSAGE"
MESSAGE="$1"

if [ -z "$MESSAGE" ]; then
    echo "Error: No message provided."
    exit 1
fi

if [ "$TELEGRAM_BOT_TOKEN" == "YOUR_BOT_TOKEN_HERE" ] || [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "Warning: Telegram credentials not configured. Message: $MESSAGE"
    exit 0
fi

curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    -d chat_id="${TELEGRAM_CHAT_ID}" \
    -d text="${MESSAGE}" \
    -d parse_mode="HTML" > /dev/null

if [ $? -eq 0 ]; then
    echo "Telegram notification sent."
else
    echo "Failed to send Telegram notification."
fi
