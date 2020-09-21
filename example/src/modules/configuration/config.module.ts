import { Module } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma-module';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';

@Module({
  imports: [PrismaModule],
  controllers: [ConfigController],
  providers: [ConfigService]
})
export class ConfigModule {}
