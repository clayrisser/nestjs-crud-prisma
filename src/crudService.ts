import { CrudService as NestJSXCrudService } from '@nestjsx/crud';

export default abstract class CrudService<T> extends NestJSXCrudService<T> {}
