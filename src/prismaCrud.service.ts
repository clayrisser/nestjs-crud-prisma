import camelcase from 'lodash/camelCase';
import mapSeriesAsync from 'map-series-async';
import { PrismaService } from 'nestjs-prisma-module';
import { isArrayFull, objKeys, isObject } from '@nestjsx/util';
import {
  CreateManyDto,
  CrudRequest,
  GetManyDefaultResponse
} from '@nestjsx/crud';
import {
  ComparisonOperator,
  QueryFilter,
  QuerySort,
  SCondition
} from '@nestjsx/crud-request';
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

export enum ColumnType {
  String = 'STRING',
  DateTime = 'DATE_TIME',
  Boolean = 'BOOLEAN',
  Int = 'INT'
}

export interface ColumnTypes {
  [key: string]: ColumnType;
}

export class PrismaCrudService<T> extends CrudService<T> {
  public tableName: string;

  public client: PrismaClient;

  private columns: ColumnTypes | undefined;

  constructor(public prisma: PrismaService, entity: Function) {
    super();
    this.tableName = camelcase(entity.name);
    this.client = this.prisma[this.tableName];
    this.getColumns();
  }

  async getColumns(): Promise<ColumnTypes> {
    if (this.columns) return this.columns;
    const result = (await this.client.findMany({ take: 1 }))?.[0] || {};
    this.columns = Object.entries(result).reduce(
      (columns: ColumnTypes, [key, value]: [string, any]) => {
        columns[key] = this.getColumnTypeFromValue(value);
        return columns;
      },
      {}
    );
    return this.columns;
  }

  getColumnTypeFromValue(value: any): ColumnType {
    switch (typeof value) {
      case 'string':
        return ColumnType.String;
      case 'object':
        return ColumnType.DateTime;
      case 'boolean':
        return ColumnType.Boolean;
      case 'number':
        return ColumnType.Int;
      default:
        return ColumnType.String;
    }
  }

  async getMany({
    parsed,
    options
  }: CrudRequest): Promise<GetManyDefaultResponse<T> | T[]> {
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
          const result = {
            OR: await Promise.all(
              (search.$or || []).map((searchItem: SCondition) =>
                this.getWhereInputFromSearch(searchItem)
              )
            )
          };
          return result;
        }
        const columns = await this.getColumns();
        let whereInput: WhereInput = {};
        await mapSeriesAsync(keys, async (field: string) => {
          const value = (search as HashMap)[field];
          if (field === 'q') {
            whereInput = await this.getWhereInputFromSearch({
              $or: Object.keys(columns).reduce(
                ($or: any[], columnKey: string) => {
                  const columnType = columns[columnKey];
                  if (columnType === ColumnType.String) {
                    $or.push({ [columnKey]: value });
                  }
                  return $or;
                },
                []
              )
            });
            return;
          }
          if (isObject(value)) {
            const keysSet = new Set(Object.keys(value));
            if (keysSet.has('$and') || keysSet.has('$or')) {
              const operator = keysSet.has('$and') ? '$and' : '$or';
              whereInput[field] = await this.getWhereInputFromSearch(
                value[operator]
              );
              return;
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
              if (!key) {
                whereInput = {};
                return;
              }
              queryFilter = {
                field,
                operator: key as ComparisonOperator,
                value: value[key]
              };
            }
            whereInput[field] = this.getFilter(queryFilter);
            return;
          }
          whereInput[field] = this.getFilter({
            field,
            value,
            operator: '$eq'
          });
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

  protected operatorSet = new Set([
    '$eq',
    '$ne',
    '$cont',
    '$gt',
    '$lt',
    '$gte',
    '$lte',
    '$starts',
    '$ends',
    '$in',
    '$notin',
    '$excl',
    '$isnull',
    '$notnull',
    '$between',
    '$eqL',
    '$neL',
    '$startsL',
    '$endsL',
    '$contL',
    '$exclL',
    '$inL',
    '$notinL',
    'eq',
    'ne',
    'cont',
    'gt',
    'lt',
    'gte',
    'lte',
    'starts',
    'ends',
    'in',
    'notin',
    'excl',
    'isnull',
    'notnull',
    'between',
    'eqL',
    'neL',
    'startsL',
    'endsL',
    'contL',
    'exclL',
    'inL',
    'notinL'
  ]);

  async getOne(req: CrudRequest): Promise<T> {
    const userID = req.parsed.paramsFilter[0];
    return this.client.findOne({
      where: {
        id: userID.value
      }
    });
  }

  async createOne(_req: CrudRequest, dto: T): Promise<T> {
    return this.client.create({
      data: dto
    });
  }

  async createMany(_req: CrudRequest, dto: CreateManyDto): Promise<T[]> {
    return Promise.all(
      dto.bulk.map((item: any) => {
        return this.client.create({
          data: item
        });
      })
    );
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
