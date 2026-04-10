import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Money Minder API',
      version: '1.0.0',
      description: 'API REST de finanzas personales',
    },
    servers: [
      { url: 'http://localhost:3000/api/v1', description: 'Desarrollo' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
            name:      { type: 'string', example: 'Juan Pérez' },
            email:     { type: 'string', format: 'email', example: 'juan@email.com' },
            currency:  { type: 'string', example: 'COP' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Account: {
          type: 'object',
          properties: {
            id:       { type: 'string', format: 'uuid' },
            userId:   { type: 'string', format: 'uuid' },
            name:     { type: 'string', example: 'Cuenta Bancolombia' },
            type:     { type: 'string', enum: ['BANK', 'CASH', 'CREDIT_CARD', 'SAVINGS'], example: 'BANK' },
            balance:  { type: 'number', example: 1500000 },
            color:    { type: 'string', example: '#4CAF50', nullable: true },
            isActive: { type: 'boolean', example: true },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id:     { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid', nullable: true },
            name:   { type: 'string', example: 'Alimentación' },
            icon:   { type: 'string', example: '🍔', nullable: true },
            type:   { type: 'string', enum: ['INCOME', 'EXPENSE'], example: 'EXPENSE' },
            color:  { type: 'string', example: '#FF5722', nullable: true },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid' },
            accountId:   { type: 'string', format: 'uuid' },
            categoryId:  { type: 'string', format: 'uuid' },
            toAccountId: { type: 'string', format: 'uuid', nullable: true },
            amount:      { type: 'number', example: 50000 },
            type:        { type: 'string', enum: ['INCOME', 'EXPENSE', 'TRANSFER'], example: 'EXPENSE' },
            description: { type: 'string', example: 'Almuerzo en restaurante' },
            date:        { type: 'string', format: 'date-time' },
            notes:       { type: 'string', nullable: true },
          },
        },
        Budget: {
          type: 'object',
          properties: {
            id:         { type: 'string', format: 'uuid' },
            userId:     { type: 'string', format: 'uuid' },
            categoryId: { type: 'string', format: 'uuid' },
            amount:     { type: 'number', example: 500000 },
            period:     { type: 'string', enum: ['WEEKLY', 'MONTHLY'], example: 'MONTHLY' },
            startDate:  { type: 'string', format: 'date-time' },
            alertAt:    { type: 'integer', example: 80, description: 'Porcentaje (0–100) al que se dispara la alerta' },
          },
        },
        SavingsGoal: {
          type: 'object',
          properties: {
            id:            { type: 'string', format: 'uuid' },
            userId:        { type: 'string', format: 'uuid' },
            name:          { type: 'string', example: 'Vacaciones en Cartagena' },
            targetAmount:  { type: 'number', example: 3000000 },
            currentAmount: { type: 'number', example: 750000 },
            deadline:      { type: 'string', format: 'date-time', nullable: true },
            status:        { type: 'string', enum: ['ACTIVE', 'COMPLETED'], example: 'ACTIVE' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Descripción del error' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field:   { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            status:  { type: 'string', example: 'success' },
            message: { type: 'string', example: 'Operación exitosa' },
            data:    { type: 'object' },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Token de acceso requerido o inválido',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        NotFound: {
          description: 'Registro no encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        ValidationError: {
          description: 'Datos de entrada inválidos',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
