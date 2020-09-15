import dotenv from 'dotenv';
import fs from 'fs';
import getPort from 'get-port';
import path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import pkg from '../package.json';
import { AppModule } from './app.module';

const logger = console;
const rootPath = path.resolve(__dirname, '../..');
dotenv.config();
process.env = {
  ...process.env,
  ...dotenv.parse(fs.readFileSync(path.resolve(rootPath, '../../prisma/.env')))
};
const { env } = process;

(async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true
  });
  app.setBaseViewsDir(path.resolve(rootPath, 'views'));
  app.setViewEngine('ejs');
  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets(path.resolve(rootPath, 'public'));
  if (env.SWAGGER === '1') {
    const options = new DocumentBuilder()
      .setTitle(pkg.name)
      .setDescription(pkg.description)
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
  }
  if (env.CORS === '1') app.enableCors();
  await app
    .listen(await getPort({ port: Number(env.PORT || 3000) }))
    .catch(logger.error);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
})();

declare const module: any;
