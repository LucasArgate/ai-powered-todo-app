import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfigService);
  
  // Enable CORS for frontend communication
  app.enableCors({
    origin: configService.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('AI-Powered Todo App API')
    .setDescription('API para aplicação de lista de tarefas com integração de IA')
    .setVersion('1.0')
    .addTag('tasks', 'Operações relacionadas às tarefas')
    .addTag('users', 'Operações relacionadas aos usuários')
    .addTag('ai', 'Integração com serviços de IA')
    .addTag('health', 'Monitoramento da aplicação')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.port;
  await app.listen(port);
  
  console.log(`🚀 Backend running on http://localhost:${port}`);
  console.log(`📊 Database: ${configService.databaseUrl}`);
  console.log(`🌍 Environment: ${configService.nodeEnv}`);
  console.log(`📚 Swagger UI: http://localhost:${port}/api`);
}
bootstrap();
