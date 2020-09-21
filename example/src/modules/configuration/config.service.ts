import { Injectable } from '@nestjs/common';
import { PrismaCrudService } from 'nestjs-crud-prisma';
import { PrismaService } from 'nestjs-prisma-module';
import { Configuration } from '../../generated/type-graphql';

@Injectable()
export class ConfigService extends PrismaCrudService<Configuration> {
  constructor(prisma: PrismaService) {
    super(prisma, Configuration);
  }
}
