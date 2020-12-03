import { CrudOptions } from '@nestjsx/crud';
import { PrismaCrudRoutesFactory } from '../prisma-crud-routes.factory';

export const PrismaCrud = (options: CrudOptions) => (target: Object) => {
  const factory = PrismaCrudRoutesFactory.create(target, options);
  // factory = undefined;
};
