import { BaseRouteName } from '@nestjsx/crud/lib/types';
import { CrudActions } from '@nestjsx/crud/lib/enums';
import { CrudOptions, BaseRoute } from '@nestjsx/crud/lib/interfaces';
import { CrudRoutesFactory } from '@nestjsx/crud/lib/crud/crud-routes.factory';

// @ts-ignore
export default class CrudRoutesFactoryShim extends CrudRoutesFactory {
  constructor(target: any, options: CrudOptions) {
    super(target, options);
  }

  protected get targetProto(): any {
    // @ts-ignore
    return super.targetProto;
  }

  protected get modelName(): string {
    // @ts-ignore
    return super.modelName;
  }

  protected get modelType(): any {
    // @ts-ignore
    return super.modelType;
  }

  protected get actionsMap(): { [key in BaseRouteName]: CrudActions } {
    // @ts-ignore
    return super.actionsMap;
  }

  protected create() {
    // @ts-ignore
    return super.create();
  }

  protected mergeOptions() {
    // @ts-ignore
    return super.mergeOptions();
  }

  protected getRoutesSchema(): BaseRoute[] {
    // @ts-ignore
    return super.getRoutesSchema();
  }

  protected getManyBase(name: BaseRouteName) {
    // @ts-ignore
    return super.getManyBase(name);
  }

  protected getOneBase(name: BaseRouteName) {
    // @ts-ignore
    return super.getOneBase(name);
  }

  protected createOneBase(name: BaseRouteName) {
    // @ts-ignore
    return super.createOneBase(name);
  }

  protected createManyBase(name: BaseRouteName) {
    // @ts-ignore
    return super.createManyBase(name);
  }

  protected updateOneBase(name: BaseRouteName) {
    // @ts-ignore
    return super.updateOneBase(name);
  }

  protected replaceOneBase(name: BaseRouteName) {
    // @ts-ignore
    return super.replaceOneBase(name);
  }

  protected deleteOneBase(name: BaseRouteName) {
    // @ts-ignore
    return super.deleteOneBase(name);
  }

  protected canCreateRoute(name: string) {
    // @ts-ignore
    return super.canCreateRoute(name);
  }

  protected setResponseModels() {
    // @ts-ignore
    return super.setResponseModels();
  }

  protected createRoutes(routesSchema: BaseRoute[]) {
    // @ts-ignore
    return super.createRoutes(routesSchema);
  }

  protected overrideRoutes(routesSchema: BaseRoute[]) {
    // @ts-ignore
    return super.overrideRoutes(routesSchema);
  }

  protected enableRoutes(routesSchema: BaseRoute[]) {
    // @ts-ignore
    return super.enableRoutes(routesSchema);
  }

  protected overrideParsedBodyDecorator(override: BaseRouteName, name: string) {
    // @ts-ignore
    return super.overrideParsedBodyDecorator(override, name);
  }

  protected getPrimaryParams(): string[] {
    // @ts-ignore
    return super.getPrimaryParams();
  }

  protected setBaseRouteMeta(name: BaseRouteName) {
    // @ts-ignore
    return super.setBaseRouteMeta(name);
  }

  protected setRouteArgs(name: BaseRouteName) {
    // @ts-ignore
    return super.setRouteArgs(name);
  }

  protected setRouteArgsTypes(name: BaseRouteName) {
    // @ts-ignore
    return super.setRouteArgsTypes(name);
  }

  protected setInterceptors(name: BaseRouteName) {
    // @ts-ignore
    return super.setInterceptors(name);
  }

  protected setDecorators(name: BaseRouteName) {
    // @ts-ignore
    return super.setDecorators(name);
  }

  protected setAction(name: BaseRouteName) {
    // @ts-ignore
    return super.setAction(name);
  }

  protected setSwaggerOperation(name: BaseRouteName) {
    // @ts-ignore
    return super.setSwaggerOperation(name);
  }

  protected setSwaggerPathParams(name: BaseRouteName) {
    // @ts-ignore
    return super.setSwaggerPathParams(name);
  }

  protected setSwaggerQueryParams(name: BaseRouteName) {
    // @ts-ignore
    return super.setSwaggerQueryParams(name);
  }

  protected setSwaggerResponseOk(name: BaseRouteName) {
    // @ts-ignore
    return super.setSwaggerResponseOk(name);
  }

  protected routeNameAction(name: BaseRouteName): string {
    // @ts-ignore
    return super.routeNameAction(name);
  }
}
