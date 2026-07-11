import {
  BadRequestException,
  type INestApplication,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';

import { AppModule } from '@/app/app.module';
import { Env } from '@/libs/configs';
import { loggerConfig } from '@/libs/configs/logger.config';
import { formatError } from '@/libs/utils/formatError.util';

class BootstrapApplication {
  async run() {
    const app = await NestFactory.create(AppModule, {
      logger: loggerConfig,
    });

    const configService = app.get(ConfigService);
    const port = configService.getOrThrow<number>(Env.PORT);
    const apiPrefix = configService.get<string>(Env.API_PREFIX, 'api');

    app.setGlobalPrefix(apiPrefix);
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    this.setupMiddleware(app, configService);

    if (configService.get<string>(Env.NODE_ENV) !== 'production') {
      this.setupSwagger(app);
    }

    await app.listen(port);
    Logger.log(
      `🚀 Server running on http://localhost:${port}/${apiPrefix}/v1`,
      BootstrapApplication.name,
    );
  }

  private setupMiddleware(app: INestApplication, configService: ConfigService) {
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        exceptionFactory: (validationErrors) => {
          return new BadRequestException(formatError(validationErrors));
        },
      }),
    );

    app.enableCors({
      origin: configService.getOrThrow<string>(Env.FE_URL),
      credentials: true,
    });

    app.use(helmet());

    const isProduction =
      configService.get<string>(Env.NODE_ENV) === 'production';
    app.use(morgan(isProduction ? 'combined' : 'dev'));
  }

  private setupSwagger(app: INestApplication) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('FinCent API')
        .setDescription('The API details of the FinCent application')
        .setVersion('1.0')
        .addTag('FinCent')
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup('docs', app, document);
  }
}

void new BootstrapApplication().run();
