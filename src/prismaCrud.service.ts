import {
  CreateManyDto,
  CrudRequest,
  CrudService,
  GetManyDefaultResponse
} from '@nestjsx/crud';

export class PrismaCrudService<T> extends CrudService<T> {
  async getMany(_req: CrudRequest): Promise<GetManyDefaultResponse<T> | T[]> {
    return [];
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
