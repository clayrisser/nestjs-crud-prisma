import { TypeValue } from 'type-graphql/dist/decorators/types';

export declare type Enumerable<T> = T | Array<T>;

export interface HashMap<T = any> {
  [key: string]: T;
}

export interface Field {
  required: boolean;
  type: TypeValue;
}

export type PrismaFilter = StringFilter | StringNullableFilter | DateTimeFilter;
export interface WhereInput {
  [key: string]:
    | string
    | Date
    | StringFilter
    | StringNullableFilter
    | DateTimeFilter
    | null
    | Enumerable<WhereInput>
    | Array<WhereInput>;
}

export interface StringFilter {
  equals?: string;
  in?: Enumerable<string>;
  notIn?: Enumerable<string>;
  lt?: string;
  lte?: string;
  gt?: string;
  gte?: string;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  not?: string | NestedStringFilter;
}
export interface NestedStringFilter {
  equals?: string;
  in?: Enumerable<string>;
  notIn?: Enumerable<string>;
  lt?: string;
  lte?: string;
  gt?: string;
  gte?: string;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  not?: NestedStringFilter | null;
}

export interface StringNullableFilter {
  equals?: string | null;
  in?: Enumerable<string> | null;
  notIn?: Enumerable<string> | null;
  lt?: string | null;
  lte?: string | null;
  gt?: string | null;
  gte?: string | null;
  contains?: string | null;
  startsWith?: string | null;
  endsWith?: string | null;
  not?: string | NestedStringNullableFilter | null;
}
export interface NestedStringNullableFilter {
  equals?: string | null;
  in?: Enumerable<string> | null;
  notIn?: Enumerable<string> | null;
  lt?: string | null;
  lte?: string | null;
  gt?: string | null;
  gte?: string | null;
  contains?: string | null;
  startsWith?: string | null;
  endsWith?: string | null;
  not?: NestedStringNullableFilter | null;
}

export interface DateTimeFilter {
  equals?: Date | string;
  in?: Enumerable<Date | string>;
  notIn?: Enumerable<Date | string>;
  lt?: Date | string;
  lte?: Date | string;
  gt?: Date | string;
  gte?: Date | string;
  not?: Date | string | NestedDateTimeFilter;
}
export interface NestedDateTimeFilter {
  equals?: Date | string;
  in?: Enumerable<Date | string>;
  notIn?: Enumerable<Date | string>;
  lt?: Date | string;
  lte?: Date | string;
  gt?: Date | string;
  gte?: Date | string;
  not?: NestedDateTimeFilter | null;
}
