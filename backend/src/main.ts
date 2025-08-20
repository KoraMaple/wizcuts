import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { env } from './config/environment';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  console.log('🚀 Starting WizCuts Barber Shop API...');

  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS configuration for luxury barber shop frontend
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      env.frontendUrl,
    ].filter(Boolean),
    credentials: true,
  });

  // Swagger documentation with elegant branding
  const config = new DocumentBuilder()
    .setTitle('WizCuts API')
    .setDescription(
      'Premium Barber Shop Management API - Crafting Digital Excellence'
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('barbers', 'Master barber management')
    .addTag('bookings', 'Appointment scheduling')
    .addTag('services', 'Premium grooming services')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'WizCuts API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { background-color: #1e293b; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
    `,
  });

  const port = env.port;
  await app.listen(port);

  console.log('✨ WizCuts API is running on:', `http://localhost:${port}`);
  console.log(
    '📚 API Documentation available at:',
    `http://localhost:${port}/api/docs`
  );
  console.log('🎨 Environment:', env.nodeEnv);
  console.log('🏪 Ready to serve premium barber shop experiences!');
}

bootstrap().catch(error => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
