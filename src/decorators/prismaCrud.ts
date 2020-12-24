import { CrudOptions } from '@nestjsx/crud';
import { PrismaCrudRoutesFactory } from '../prismaCrudRoutesFactory';

export const PrismaCrud = (options: CrudOptions) => (target: Object) => {
  PrismaCrudRoutesFactory.create(target, options);
};
