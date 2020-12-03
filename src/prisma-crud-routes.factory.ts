import CrudRoutesFactory  from '@nestjsx/crud';

export class PrismaCrudRoutesFactory extends CrudRoutesFactory {
  setResponseModels() {
    console.log('extended class func');
  }
}
