import {
  CreateManyDto,
  CrudRequest,
  GetManyDefaultResponse
} from '@nestjsx/crud';
import {
  QuerySort,
  QueryFilter,
  SCondition,
  SConditionKey,
  ComparisonOperator
} from '@nestjsx/crud-request';
import camelcase from 'lodash/camelCase';
import { PrismaService } from 'nestjs-prisma-module';
import CrudService from './crudService';
import { WhereInput, HashMap, PrismaFilter } from './types';
import { isArrayFull, objKeys, isObject } from '@nestjsx/util';

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
    console.log('search', JSON.stringify(parsed.search, null, 2));
    console.log(
      'where',
      JSON.stringify(this.getWhereInputFromSearch(parsed.search), null, 2)
    );
    if (this.decidePagination(parsed, options)) {
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
        ...(parsed.or
          ? {
              where: this.getWhereInputFromOr(parsed.or)
            }
          : {}),
        ...(parsed.filter
          ? {
              where: this.getWhereInputFromFilter(parsed.filter)
            }
          : {}),
        ...(parsed.search
          ? {
              where: this.getWhereInputFromSearch(parsed.search)
            }
          : {}),
        ...(parsed.limit ? { take: parsed.limit } : {}),
        ...(parsed.offset ? { skip: parsed.offset } : {})
      });
      const { limit, offset } = parsed;
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
      ...(parsed.or
        ? {
            where: this.getWhereInputFromOr(parsed.or)
          }
        : {}),
      ...(parsed.filter
        ? {
            where: this.getWhereInputFromFilter(parsed.filter)
          }
        : {}),
      ...(parsed.search
        ? {
            where: this.getWhereInputFromSearch(parsed.search)
          }
        : {}),
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
      ...(parsed.limit ? { take: parsed.limit } : {})
    });
  }

  protected getWhereInputFromFilter(filter: QueryFilter[]): WhereInput {
    return this.getWhereInputFromSearch({ $and: filter });
  }

  protected getWhereInputFromOr(or: QueryFilter[]): WhereInput {
    return this.getWhereInputFromSearch({ $or: or });
  }

  protected getWhereInputFromSearch(search: SCondition): WhereInput {
    if (isObject(search)) {
      const keys = objKeys(search);
      if (keys.length) {
        if (isArrayFull(search.$and)) {
          return {
            AND: (search.$and || []).map((searchItem: SCondition) =>
              this.getWhereInputFromSearch(searchItem)
            )
          };
        } else if (isArrayFull(search.$or)) {
          if (Object.keys(search).length > 1) {
            return this.getWhereInputFromSearch({
              $and: [
                ...Object.entries(search).map(
                  ([key, searchItem]: [string, any]) => {
                    // TODO: need to look further
                    return { [key]: searchItem };
                  }
                ),
                { $or: search.$or }
              ]
            });
          }
          return {
            OR: (search.$or || []).map((searchItem: SCondition) =>
              this.getWhereInputFromSearch(searchItem)
            )
          };
        }
        return keys.reduce((whereInput: WhereInput, field: string) => {
          const value = (search as HashMap)[field];
          if (isObject(value)) {
            const keysSet = new Set(Object.keys(value));
            if (keysSet.has('$and') || keysSet.has('$or')) {
              const operator = keysSet.has('$and') ? '$and' : '$or';
              whereInput[field] = this.getWhereInputFromSearch(value[operator]);
              return whereInput;
            }
            let queryFilter: QueryFilter = value;
            if (
              typeof value.operator === 'undefined' ||
              typeof value.value === 'undefined' ||
              typeof value.field === 'undefined'
            ) {
              const key = Object.keys(value).find(
                (key: string) => key.length && key[0] === '$'
              );
              if (!key) return {};
              queryFilter = {
                field,
                operator: key as ComparisonOperator,
                value: value[key]
              };
            }
            whereInput[field] = this.getFilter(queryFilter);
            return whereInput;
          }
          whereInput[field] = this.getFilter({
            field,
            value,
            operator: '$eq'
          });
          return whereInput;
        }, {});
      }
    }
    return {};
  }

  protected getFilter(queryFilter: QueryFilter): PrismaFilter {
    switch (queryFilter.operator) {
      case '$eq':
        return { equals: queryFilter.value };
      case '$ne':
        return { not: queryFilter.value };
      case '$gt':
        return { gt: queryFilter.value };
      case '$lt':
        return { lt: queryFilter.value };
      case '$gte':
        return { gte: queryFilter.value };
      case '$lte':
        return { lte: queryFilter.value };
      case '$starts':
        return { startsWith: queryFilter.value };
      case '$ends':
        return { endsWith: queryFilter.value };
      case '$cont':
        return { contains: queryFilter.value };
      case '$excl':
        return {};
      case '$in':
        return { in: queryFilter.value };
      case '$notin':
        return { notIn: queryFilter.value };
      case '$isnull':
        return {};
      case '$notnull':
        return {};
      case '$between':
        return {};
      case '$eqL':
        return {};
      case '$neL':
        return {};
      case '$startsL':
        return {};
      case '$endsL':
        return {};
      case '$contL':
        return {};
      case '$exclL':
        return {};
      case '$inL':
        return {};
      case '$notinL':
        return {};
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
