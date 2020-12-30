import * as TypeGraphql from 'type-graphql';
import { CrudOptions } from '@nestjsx/crud/lib/interfaces';
import { FieldMetadata } from 'type-graphql/dist/metadata/definitions';
import { SerializeHelper } from '@nestjsx/crud/lib/crud/serialize.helper';
import { Swagger } from '@nestjsx/crud/lib/crud/swagger.helper';
import { isFunction } from '@nestjsx/util';
import { TypeValue } from 'type-graphql/dist/decorators/types';
import CrudRoutesFactoryShim from './crudRoutesFactoryShim';
import { Field, HashMap } from './types';

// @ts-ignore
export class PrismaCrudRoutesFactory extends CrudRoutesFactoryShim {
  protected swaggerModels: any = {};

  private _models: HashMap<Field> = {};

  constructor(target: any, options: CrudOptions) {
    super(target, options);
  }

  static create(target: any, options: CrudOptions): PrismaCrudRoutesFactory {
    return new PrismaCrudRoutesFactory(target, options);
  }

  protected setResponseModels() {
    const prismaModelType = isFunction(this.modelType)
      ? this.modelType
      : SerializeHelper.createGetOneResponseDto(this.modelName);
    const modelType = this.createModelType(prismaModelType);
    this.swaggerModels.get = isFunction(this.options.serialize?.get)
      ? this.options.serialize?.get
      : modelType;
    this.swaggerModels.getMany =
      this.options.serialize?.getMany ||
      SerializeHelper.createGetManyDto(this.swaggerModels.get, this.modelName);
    this.swaggerModels.create = isFunction(this.options.serialize?.create)
      ? this.options.serialize?.create
      : modelType;
    this.swaggerModels.update = isFunction(this.options.serialize?.update)
      ? this.options.serialize?.update
      : modelType;
    this.swaggerModels.replace = isFunction(this.options.serialize?.replace)
      ? this.options.serialize?.replace
      : modelType;
    this.swaggerModels.delete = isFunction(this.options.serialize?.delete)
      ? this.options.serialize?.delete
      : modelType;
    Swagger.setExtraModels(this.swaggerModels);
  }

  private createModelType(ModelType: any) {
    ModelType._OPENAPI_METADATA_FACTORY = () =>
      TypeGraphql.getMetadataStorage()
        .fields.filter(
          (fieldMetadata: FieldMetadata) => fieldMetadata.target === ModelType
        )
        .reduce((fields: HashMap<Field>, fieldMetadata: FieldMetadata) => {
          const swaggerType = this.getSwaggerType(fieldMetadata);
          if (!swaggerType) return fields;
          fields[fieldMetadata.name] = {
            required: !fieldMetadata.typeOptions.nullable,
            type: swaggerType
          };
          return fields;
        }, {});
    if (!this._models) this._models = {};
    this._models[ModelType.name] = ModelType;
    return ModelType;
  }

  private getSwaggerType(fieldMetadata: FieldMetadata): TypeValue | undefined {
    const swaggerType = fieldMetadata.getType();
    if (!swaggerType) return;
    switch (swaggerType.toString()) {
      case 'Int':
        return Number;
      case 'Float':
        return Number;
      case 'JSON':
        return JSON;
    }
    if (typeof swaggerType === 'function') return swaggerType;
    if (
      typeof swaggerType === 'object' &&
      symmetricDifference(
        new Set(Object.keys(swaggerType)),
        new Set(Object.values(swaggerType))
      )
    ) {
      return String;
    }
    console.warn(
      `unknown type ${typeof swaggerType} ${swaggerType.toString()}`
    );
  }
}

function difference<T = any>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a].filter((x) => !b.has(x)));
}

function symmetricDifference<T = any>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...difference(a, b), ...difference(b, a)]);
}
