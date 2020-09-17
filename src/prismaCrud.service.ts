import {
  CreateManyDto,
  CrudRequest,
  GetManyDefaultResponse
} from '@nestjsx/crud';
import {
  QuerySort,
  QuerySortOperator,
  QueryFilter
} from '@nestjsx/crud-request';
import camelcase from 'lodash/camelCase';
import { PrismaService } from 'nestjs-prisma-module';
import CrudService from './crudService';

export interface OrderBy {
  [key: string]: 'asc' | 'desc' | undefined;
}

export interface Where {
  [key: string]: string;
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
        ...(parsed.filter
          ? {
              where: {
                ...parsed.filter.reduce(
                  (where: Where, queryFilter: QueryFilter) => {
                    where[queryFilter.field] = queryFilter.value;
                    return where;
                  },
                  {}
                )
              }
            }
          : {}),
        ...(parsed.limit ? { take: parsed.limit } : {}),
        ...(parsed.offset ? { skip: parsed.offset } : {})
      });
      const { limit } = parsed;
      const { offset } = parsed;
      const response: GetManyDefaultResponse<T> = {
        data: result,
        count: result.length,
        total,
        page: limit && offset ? Math.floor(offset / limit) + 1 : 1,
        pageCount: limit && total ? Math.ceil(result.length / limit) : 1
      };
      console.log('response', response);
      return response;
    }
    return this.client.findMany({
      ...(parsed.filter
        ? {
            where: {
              ...parsed.filter.reduce(
                (where: Where, queryFilter: QueryFilter) => {
                  where[queryFilter.field] = queryFilter.value;
                  return where;
                },
                {}
              )
            }
          }
        : {})
    });
  }

  async getOne(req: CrudRequest): Promise<T> {
    const userID = req.parsed.paramsFilter[0];
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
