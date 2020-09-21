import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { ConfigService } from './config.service';
import { Configuration } from '../../generated/type-graphql';

@Crud({
  model: {
    type: Configuration
  },
  params: {
    id: {
      field: 'id',
      type: 'string',
      primary: true
    }
  },
  query: {
    alwaysPaginate: true
  }
})
@Controller('config')
export class ConfigController {
  constructor(public service: ConfigService) {}
}
