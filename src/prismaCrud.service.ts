import {
  CreateManyDto,
  CrudRequest,
  CrudService,
  GetManyDefaultResponse
} from '@nestjsx/crud';
import camelcase from 'lodash/camelCase';
import { PrismaService } from 'nestjs-prisma-module';

export class PrismaCrudService<T> extends CrudService<T> {
  public tableName: string;

  public client: PrismaClient;

  constructor(public prisma: PrismaService, entity: Function) {
    super();
    this.tableName = camelcase(entity.name);
    this.client = this.prisma[this.tableName];
  }

  async getMany(_req: CrudRequest): Promise<GetManyDefaultResponse<T> | T[]> {
    return this.client.findMany();
  }

  async getOne(_req: CrudRequest): Promise<T> {
    return {} as T;
  }

  async createOne(_req: CrudRequest, _dto: T): Promise<T> {
    return {} as T;
  }

  async createMany(_req: CrudRequest, _dto: CreateManyDto): Promise<T[]> {
    return [];
  }

  async updateOne(_req: CrudRequest, _dto: T): Promise<T> {
    return {} as T;
  }

  async replaceOne(_req: CrudRequest, _dto: T): Promise<T> {
    return {} as T;
  }

  async deleteOne(_req: CrudRequest): Promise<void | T> {
    return {} as T;
  }
}

export type PrismaClient = any;
