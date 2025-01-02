import {Express} from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

export function swaggerSetup(app: Express): void {
    const options = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'CSV Upload / Interaction API',
                version: '1.0.0',
                description: 'API for uploading, validating, and interaction into PostgreSQL.'
            }
        },
        apis: [
            // Provide patterns that match your route files
            './src/routes/*.ts'
        ],
    };

    const specs = swaggerJsdoc(options);

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}