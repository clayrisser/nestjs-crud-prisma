import { CrudOptions } from '@nestjsx/crud';

export const PrismaCrud = (options: CrudOptions) => (target: Object) => {
  let factory = PrimsaCrudRoutesFactory.create(target, options);
  factory = undefined;
};
