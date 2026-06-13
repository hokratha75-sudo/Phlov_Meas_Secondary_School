const fs = require('fs');
const path = require('path');

const openapiPath = path.join(__dirname, 'lib', 'api-spec', 'openapi.yaml');
let content = fs.readFileSync(openapiPath, 'utf8');

// 1. Remove the injected paths from the schemas section
const badPathsStart = `  /telegram/messages:`;
const badPathsEnd = `  /telegram/reply:
    post:
      summary: Send reply to user
      tags: [TelegramInbox]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                chatId:
                  type: integer
                messageText:
                  type: string
              required: [chatId, messageText]
      responses:
        '200':
          description: Reply sent
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TelegramMessage'`;

const badBlockRegex = new RegExp(
  badPathsStart.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&') + 
  '[\\s\\S]*?' + 
  badPathsEnd.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&') + 
  '\\n'
);

content = content.replace(badBlockRegex, '');

// 2. Inject the paths just before "components:"
const pathsToAdd = `
  /telegram/messages:
    get:
      summary: Get all messages (paginated)
      tags: [TelegramInbox]
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 50
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
        - name: search
          in: query
          schema:
            type: string
        - name: status
          in: query
          schema:
            type: string
      responses:
        '200':
          description: A list of telegram messages
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TelegramMessageListResponse'

  /telegram/messages/unread:
    get:
      summary: Get unread count and list
      tags: [TelegramInbox]
      responses:
        '200':
          description: Unread messages
          content:
            application/json:
              schema:
                type: object
                properties:
                  count:
                    type: integer
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/TelegramMessage'
                required: [count, data]

  /telegram/messages/{id}:
    get:
      summary: Get single message
      tags: [TelegramInbox]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: A single message
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TelegramMessage'
    put:
      summary: Update message status
      tags: [TelegramInbox]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateTelegramMessageStatusRequest'
      responses:
        '200':
          description: Status updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TelegramMessage'
    delete:
      summary: Delete message (admin only)
      tags: [TelegramInbox]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Deleted
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MessageResponse'

  /telegram/reply:
    post:
      summary: Send reply to user
      tags: [TelegramInbox]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                chatId:
                  type: integer
                messageText:
                  type: string
              required: [chatId, messageText]
      responses:
        '200':
          description: Reply sent
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TelegramMessage'
`;

content = content.replace(/^components:/m, pathsToAdd + '\ncomponents:');

fs.writeFileSync(openapiPath, content);
console.log("Fixed openapi.yaml");
