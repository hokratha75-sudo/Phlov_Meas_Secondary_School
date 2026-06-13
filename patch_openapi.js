const fs = require('fs');
const path = require('path');

const openapiPath = path.join(__dirname, 'lib', 'api-spec', 'openapi.yaml');
let content = fs.readFileSync(openapiPath, 'utf8');

const pathsToAdd = `
  /telegram/messages:
    get:
      summary: List telegram messages
      tags: [Telegram]
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
        - name: status
          in: query
          schema:
            type: string
        - name: search
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

  /telegram/messages/{chatId}/reply:
    post:
      summary: Reply to a telegram user
      tags: [Telegram]
      parameters:
        - name: chatId
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TelegramReplyRequest'
      responses:
        '200':
          description: Reply sent
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TelegramMessage'

  /telegram/messages/{id}/status:
    put:
      summary: Update message status
      tags: [Telegram]
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
`;

const schemasToAdd = `
    TelegramMessage:
      type: object
      properties:
        id:
          type: integer
        messageId:
          type: integer
        chatId:
          type: integer
        userId:
          type: integer
          nullable: true
        username:
          type: string
          nullable: true
        firstName:
          type: string
          nullable: true
        lastName:
          type: string
          nullable: true
        messageText:
          type: string
          nullable: true
        isFromBot:
          type: boolean
        isReplyToAdmin:
          type: boolean
        repliedBy:
          type: integer
          nullable: true
        repliedAt:
          type: string
          nullable: true
        status:
          type: string
        createdAt:
          type: string
      required: [id, messageId, chatId, isFromBot, isReplyToAdmin, status, createdAt]

    TelegramMessageListResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/TelegramMessage'
        total:
          type: integer
      required: [data, total]

    TelegramReplyRequest:
      type: object
      properties:
        messageText:
          type: string
      required: [messageText]

    UpdateTelegramMessageStatusRequest:
      type: object
      properties:
        status:
          type: string
      required: [status]
`;

// Insert paths before components:
content = content.replace(/^components:/m, pathsToAdd + '\ncomponents:');

// Insert schemas at the end of the file
content += schemasToAdd;

fs.writeFileSync(openapiPath, content);
console.log("Appended to openapi.yaml");
