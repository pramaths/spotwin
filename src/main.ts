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
import * as bodyParser from 'body-parser';

declare const module: any;

async function bootstrap() {
  if (process.env.REPL_MODE) {
    await repl(AppModule);
  } else {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'verbose', 'debug'],
      bodyParser: false,
    });
    app.use(bodyParser.json({ limit: '100mb' }));
    app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
    app.use(cookieParser());
    app.use(helmet());
    app.use(bodyParser.raw({ 
      type: 'application/octet-stream',
      limit: '100mb'
    }));
    app.enableCors({
      origin: process.env.NODE_ENV === 'production' 
        ? ["https://gibberish-agbilemon.vercel.app", "http://localhost:3000"] 
        : ['https://9shootsshhr2332jferere.vercel.app', 'https://gibberish-agbilemon.vercel.app/', 'http://localhost:8081', 'http://localhost:3000'],
      allowedHeaders: ['Authorization', 'Content-Type', 'x-phone-number'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      maxAge: 86400, // 24 hours in seconds - caching preflight requests
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
    await app.listen(PORT, '0.0.0.0', () => {
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
