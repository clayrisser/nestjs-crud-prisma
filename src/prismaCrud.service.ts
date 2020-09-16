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
    console.log('_req', _req, _req.options.query);
    return this.client.findMany({
      orderBy: {
        firstname: 'asc'
      }
    });
  }

  async getOne(req: CrudRequest): Promise<T> {
    console.log('_req', req);
    const userID = req.parsed.paramsFilter[0];
    console.log('id value', userID);

    return this.client.findOne({
      where: {
        id: userID.value
      }
    });
    // return {} as T;
  }

  async createOne(_req: CrudRequest, _dto: T): Promise<T> {
    console.log(
      'create request',
      _req,
      _req.parsed.fields,
      _req.options.params
    );
    return this.client.create({
      data: {
        email: 'testing1@gmail.com',
        password: 'abc',
        firstname: 'test user1',
        role: 'USER'
      }
    });
    // return {} as T;
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

  async deleteOne(req: CrudRequest): Promise<void | T> {
    const userID = req.parsed.paramsFilter[0];
    return this.client.delete({
      where: {
        id: userID.value
      }
    });
    // return {} as T;
  }
}

export type PrismaClient = any;
