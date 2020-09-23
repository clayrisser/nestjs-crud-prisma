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
import { isArrayFull, objKeys, isObject } from '@nestjsx/util';
import mapSeriesAsync from 'map-series-async';
import CrudService from './crudService';
import { WhereInput, HashMap, PrismaFilter } from './types';

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

  private columns: string[] | undefined;

  constructor(public prisma: PrismaService, entity: Function) {
    super();
    this.tableName = camelcase(entity.name);
    this.client = this.prisma[this.tableName];
    this.getColumns();
  }

  async getColumns(): Promise<string[]> {
    if (this.columns) return this.columns;
    this.columns = Object.keys(
      (await this.client.findMany({ take: 1 }))?.[0] || {}
    );
    return this.columns;
  }

  async getMany({
    parsed,
    options
  }: CrudRequest): Promise<GetManyDefaultResponse<T> | T[]> {
    console.log('search', JSON.stringify(parsed.search, null, 2));
    console.log(
      'where',
      JSON.stringify(await this.getWhereInputFromSearch(parsed.search), null, 2)
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
              where: await this.getWhereInputFromOr(parsed.or)
            }
          : {}),
        ...(parsed.filter
          ? {
              where: await this.getWhereInputFromFilter(parsed.filter)
            }
          : {}),
        ...(parsed.search
          ? {
              where: await this.getWhereInputFromSearch(parsed.search)
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
            where: await this.getWhereInputFromOr(parsed.or)
          }
        : {}),
      ...(parsed.filter
        ? {
            where: await this.getWhereInputFromFilter(parsed.filter)
          }
        : {}),
      ...(parsed.search
        ? {
            where: await this.getWhereInputFromSearch(parsed.search)
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

  protected async getWhereInputFromFilter(
    filter: QueryFilter[]
  ): Promise<WhereInput> {
    return this.getWhereInputFromSearch({ $and: filter });
  }

  protected async getWhereInputFromOr(or: QueryFilter[]): Promise<WhereInput> {
    return this.getWhereInputFromSearch({ $or: or });
  }

  protected async getWhereInputFromSearch(
    search: SCondition
  ): Promise<WhereInput> {
    if (isObject(search)) {
      const keys = objKeys(search);
      if (keys.length) {
        if (isArrayFull(search.$and)) {
          return {
            AND: await Promise.all(
              (search.$and || []).map((searchItem: SCondition) =>
                this.getWhereInputFromSearch(searchItem)
              )
            )
          };
        }
        if (isArrayFull(search.$or)) {
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
            OR: await Promise.all(
              (search.$or || []).map((searchItem: SCondition) =>
                this.getWhereInputFromSearch(searchItem)
              )
            )
          };
        }
        const columns = await this.getColumns();
        console.log('columns', columns);
        const whereInput: WhereInput = {};
        await mapSeriesAsync(keys, async (field: string) => {
          const value = (search as HashMap)[field];
          if (field === 'q') {
            return this.getWhereInputFromSearch({
              $or: columns.map((column: string) => {
                return { [column]: value };
              })
            });
          }
          if (isObject(value)) {
            const keysSet = new Set(Object.keys(value));
            if (keysSet.has('$and') || keysSet.has('$or')) {
              const operator = keysSet.has('$and') ? '$and' : '$or';
              whereInput[field] = await this.getWhereInputFromSearch(
                value[operator]
              );
              return whereInput;
            }
            let queryFilter: QueryFilter = value;
            if (
              typeof value.operator === 'undefined' ||
              typeof value.value === 'undefined' ||
              typeof value.field === 'undefined'
            ) {
              const key = Object.keys(value).find((key: string) =>
                this.operatorSet.has(key)
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
        });
        return whereInput;
      }
    }
    return {};
  }

  protected getFilter(queryFilter: QueryFilter): PrismaFilter {
    const operator =
      queryFilter.operator[0] === '$'
        ? queryFilter.operator
        : `$${queryFilter.operator}`;
    switch (operator) {
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

  protected operatorSet = new Set(['$eq', '$ne', 'cont', '$cont']);

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
