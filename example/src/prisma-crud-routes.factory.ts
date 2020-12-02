import CrudRoutesFactory from '@nestjsx/crud'

export class PrismaCrudRoutesFactory extends CrudRoutesFactory {
  private setResponseModels() {
    console.log('extended class func')
  }
}
