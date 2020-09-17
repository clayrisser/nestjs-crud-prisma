import {
  CrudService as NestJSXCrudService,
  CrudRequestOptions
} from '@nestjsx/crud';
import { ParsedRequestParams } from '@nestjsx/crud-request';

export default abstract class CrudService<T> extends NestJSXCrudService<T> {
  decidePagination(
    parsed: ParsedRequestParams,
    options: CrudRequestOptions
  ): boolean {
    return (
      options.query?.alwaysPaginate ||
      ((Number.isFinite(parsed.page) || Number.isFinite(parsed.offset)) &&
        !!this.getTake(parsed, options.query!))
    );
  }
}
