import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MedMitra API Documentation',
      version: '1.0.0',
      description:
        'MedMitra — AI-Assisted Clinical Documentation & Case-Taking Platform API Spec.',
      contact: {
        name: 'MedMitra Engineering Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Backend Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['patient', 'doctor', 'admin'] },
            fullName: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },
        Patient: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            dob: { type: 'string', format: 'date' },
            gender: { type: 'string', enum: ['male', 'female', 'other'] },
            phone: { type: 'string' },
            address: { type: 'string' },
          },
        },
        Doctor: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            licenseNumber: { type: 'string' },
            specialization: { type: 'string' },
            department: { type: 'string' },
          },
        },
        VerifiedRecord: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            patientId: { type: 'string' },
            doctorId: { type: 'string' },
            consultationId: { type: 'string' },
            verifiedContent: { type: 'string' },
            finalDiagnosis: { type: 'array', items: { type: 'string' } },
            doctorSignature: { type: 'string' },
            verifiedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
