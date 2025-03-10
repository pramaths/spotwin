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
      origin: ['http://localhost:3000', 'http://localhost:8081'],
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
      .setDescription('The 9Shoot API description')
      .setVersion('1.0')
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

    // Add middleware to show validation errors
    app.use((req, res, next) => {
      const originalSend = res.send;
      res.send = function (body) {
        if (res.statusCode >= 400) {
          console.log('Error Response:', {
            statusCode: res.statusCode,
            path: req.path,
            method: req.method,
            body: typeof body === 'string' ? JSON.parse(body) : body,
          });
        }
        return originalSend.call(this, body);
      };
      next();
    });

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
