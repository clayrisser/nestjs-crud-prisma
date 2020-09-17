import {
  CreateManyDto,
  CrudRequest,
  GetManyDefaultResponse
} from '@nestjsx/crud';
import { QuerySort, QuerySortOperator } from '@nestjsx/crud-request';
import camelcase from 'lodash/camelCase';
import { PrismaService } from 'nestjs-prisma-module';
import CrudService from './crudService';

export interface OrderBy {
  [key: string]: 'asc' | 'desc' | undefined;
}

export class PrismaCrudService<T> extends CrudService<T> {
  public tableName: string;

  public client: PrismaClient;

  constructor(public prisma: PrismaService, entity: Function) {
    super();
    this.tableName = camelcase(entity.name);
    this.client = this.prisma[this.tableName];
  }

  async getMany({
    parsed,
    options
  }: CrudRequest): Promise<GetManyDefaultResponse<T> | T[]> {
    if (this.decidePagination(parsed, options)) {
      // pagintated response
      const total = await this.client.count();
      const result = await this.client.findMany({
        ...(parsed.sort
          ? {
              orderBy: {
                ...parsed.sort.reduce(
                  (orderBy: OrderBy, querySort: QuerySort) => {
                    orderBy[querySort.field] = (
                      querySort.order || 'ASC'
                    ).toLowerCase() as 'asc' | 'desc';
                    return orderBy;
                  },
                  {}
                )
              }
            }
          : {}),
        ...(parsed.limit ? { skip: parsed.limit } : {})
      });
      const response: GetManyDefaultResponse<T> = {
        data: result,
        count: result.length,
        total,
        page: 0,
        pageCount: 1
      };
      return response;
    }
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
