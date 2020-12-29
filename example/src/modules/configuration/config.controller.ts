import { Controller } from '@nestjs/common';
import { PrismaCrud } from 'nestjs-crud-prisma';
import { ConfigService } from './config.service';
import { Configuration } from '../../generated/type-graphql';

@PrismaCrud({
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
@Controller('configurations')
export class ConfigController {
  constructor(public service: ConfigService) {}
}
