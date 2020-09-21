import {
  CreateManyDto,
  CrudRequest,
  GetManyDefaultResponse
} from '@nestjsx/crud';
import { QuerySort, QueryFilter } from '@nestjsx/crud-request';
import camelcase from 'lodash/camelCase';
import { PrismaService } from 'nestjs-prisma-module';
import CrudService from './crudService';

export interface OrderBy {
  [key: string]: 'asc' | 'desc' | undefined;
}

export interface Operator {
  startsWith?: string | undefined;
  contains?: string | undefined;
  equals?: string | undefined;
}

export interface Where {
  [key: string]: string | Operator | Date;
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
        ...(parsed.sort.length > 0
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
                    this.handleOperator(where, queryFilter);
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
        page: limit ? Math.floor(offset / limit) + 1 : 1,
        pageCount: limit && total ? Math.ceil(total / limit) : 1
      };
      return response;
    }
    return this.client.findMany({
      ...(parsed.filter
        ? {
            where: {
              ...parsed.filter.reduce(
                (where: Where, queryFilter: QueryFilter) => {
                  this.handleOperator(where, queryFilter);
                  return where;
                },
                {}
              )
            }
          }
        : {})
    });
  }

  async handleOperator(where: Where, queryFilter: QueryFilter) {
    switch (queryFilter.operator) {
      case '$starts':
        return (where[queryFilter.field] = {
          startsWith: queryFilter.value
        });
      case '$cont':
        return (where[queryFilter.field] = {
          contains: queryFilter.value
        });
      case '$eq':
        return (where[queryFilter.field] = {
          equals: queryFilter.value
        });
      default:
        return {};
    }
  }

  async getOne(req: CrudRequest): Promise<T> {
    const userID = req.parsed.paramsFilter[0];
    return this.client.findOne({
      where: {
        id: userID.value
      }
    });
  }

  async createOne(req: CrudRequest, dto: T): Promise<T> {
    return this.client.create({
      data: dto
    });
  }

  async createMany(_req: CrudRequest, dto: CreateManyDto): Promise<T[]> {
    const data = dto.bulk.map((item: any) => {
      return this.client.create({
        data: item
      });
    });
    await data.map((item: any) => {
      return item.then();
    });
    return dto.bulk;
  }

  async updateOne(req: CrudRequest, dto: T): Promise<T> {
    const userID = req.parsed.paramsFilter[0];
    return this.client.update({
      where: {
        id: userID.value
      },
      data: dto
    });
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
  }
}

export type PrismaClient = any;
