import { CrudOptions } from '@nestjsx/crud';
import { PrismaCrudRoutesFactory } from '../prisma-crud-routes.factory';

export const PrismaCrud = (options: CrudOptions) => (target: Object) => {
  PrismaCrudRoutesFactory.create(target, options);
};
