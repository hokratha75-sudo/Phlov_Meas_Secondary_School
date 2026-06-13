const fs = require('fs');
let yaml = fs.readFileSync('openapi.yaml', 'utf8');

const pathsToAdd = `
  /api/id-card-templates:
    get:
      summary: List all ID card templates
      tags: [IDCardTemplates]
      security:
        - bearerAuth: []
      responses:
        '200':
          description: A list of ID card templates
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ListIdCardTemplatesResponse'
    post:
      summary: Create ID card template
      tags: [IDCardTemplates]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateIdCardTemplateBody'
      responses:
        '201':
          description: The created template
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/IdCardTemplate'

  /api/id-card-templates/{id}:
    put:
      summary: Update ID card template
      tags: [IDCardTemplates]
      security:
        - bearerAuth: []
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
              $ref: '#/components/schemas/UpdateIdCardTemplateBody'
      responses:
        '200':
          description: The updated template
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/IdCardTemplate'
    delete:
      summary: Delete ID card template
      tags: [IDCardTemplates]
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Template deleted
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DeleteIdCardTemplateResponse'
`;

const schemasToAdd = `
    IdCardTemplate:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        baseStyle:
          type: string
        config:
          type: object
        createdAt:
          type: string
        updatedAt:
          type: string
      required: [id, name, baseStyle, config, createdAt, updatedAt]

    ListIdCardTemplatesResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/IdCardTemplate'
        total:
          type: integer
      required: [data, total]

    CreateIdCardTemplateBody:
      type: object
      properties:
        name:
          type: string
        baseStyle:
          type: string
        config:
          type: object
      required: [name, config]

    UpdateIdCardTemplateBody:
      type: object
      properties:
        name:
          type: string
        baseStyle:
          type: string
        config:
          type: object

    DeleteIdCardTemplateResponse:
      type: object
      properties:
        message:
          type: string
      required: [message]
`;

const componentsIdx = yaml.indexOf('components:');
const yamlWithPaths = yaml.slice(0, componentsIdx) + pathsToAdd + yaml.slice(componentsIdx);
const finalYaml = yamlWithPaths + schemasToAdd;

fs.writeFileSync('openapi.yaml', finalYaml);
console.log('updated');
