import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ConsoleLogger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

class MyLogger extends ConsoleLogger {
    log(message: string, context?: string) {
        if (context === 'RoutesResolver' || context === 'RouterExplorer' || context === 'InstanceLoader') return;
        super.log(message, context);
    }
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: new MyLogger()
    });

    app.setGlobalPrefix('api/v1');
    app.enableCors();

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());
    const config = new DocumentBuilder()
        .setTitle('MovieStream API')
        .setDescription('A secure, scalable backend API for a movie streaming platform with user management, subscription plans, and comprehensive movie catalog features.')
        .setVersion('1.0')
        .addTag('Auth', 'Authentication endpoints')
        .addTag('Profiles', 'User profile endpoints')
        .addTag('Subscription Plans', 'Subscription plan management')
        .addTag('User Subscriptions', 'User subscription endpoints')
        .addTag('Payments', 'Payment processing endpoints')
        .addTag('Categories', 'Movie category endpoints')
        .addTag('Movies', 'Movie management endpoints')
        .addTag('Reviews', 'Movie review endpoints')
        .addBearerAuth({
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
            },
            'JWT-auth',
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
    });
    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();