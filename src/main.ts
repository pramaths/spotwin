import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { repl } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import * as morgan from 'morgan';

declare const module: any;

async function bootstrap() {
  if (process.env.REPL_MODE) {
    await repl(AppModule);
  } else {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'verbose', 'debug'],
    });

    app.use(cookieParser());
    app.use(helmet());
    app.enableCors({
      origin: ['http://localhost:3000', 'http://localhost:4000'],
      credentials: true,
      allowedHeaders: ['Authorization', 'Content-Type'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    const config = new DocumentBuilder()
      .setTitle('9Shoot API')
      .setDescription('API documentation for the 9shoot  API')
      .setVersion('1.0')
      .addTag('9shoot')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // Add morgan middleware with custom format
    app.use(
      morgan(':method :url :status :response-time ms - :res[content-length]', {
        stream: {
          write: (message) => Logger.log(message.trim(), 'HTTP'),
        },
      }),
    );

    const PORT = process.env.PORT ?? 8000;
    await app.listen(process.env.PORT, () => {
      Logger.log(`Server is running on port ${PORT}`);
      Logger.log(`API Documentation: http://localhost:${PORT}/api`);
    });

    if (module.hot) {
      module.hot.accept();
      module.hot.dispose(() => app.close());
    }
  }
}
bootstrap();
