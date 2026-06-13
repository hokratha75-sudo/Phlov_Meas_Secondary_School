const fs = require('fs');
const path = require('path');

const openapiPath = path.join(__dirname, 'lib', 'api-spec', 'openapi.yaml');
let content = fs.readFileSync(openapiPath, 'utf8');

const badRequestBody = `            schema:
              type: object
              properties:
                chatId:
                  type: integer
                messageText:
                  type: string
              required: [chatId, messageText]`;

const goodRequestBody = `            schema:
              $ref: '#/components/schemas/TelegramReplyRequest'`;

content = content.replace(badRequestBody, goodRequestBody);

const badReplyRequestSchema = `    TelegramReplyRequest:
      type: object
      properties:
        messageText:
          type: string
      required: [messageText]`;

const goodReplyRequestSchema = `    TelegramReplyRequest:
      type: object
      properties:
        chatId:
          type: integer
        messageText:
          type: string
      required: [chatId, messageText]`;

// It might not exist, but let's try replacing it, or if not found, we don't have to worry if we just inject it if it's missing.
if (content.includes('TelegramReplyRequest:')) {
  content = content.replace(badReplyRequestSchema, goodReplyRequestSchema);
} else {
  content += "\n" + goodReplyRequestSchema;
}

fs.writeFileSync(openapiPath, content);
console.log("Fixed openapi.yaml inline schema");
