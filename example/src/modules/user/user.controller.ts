import { Controller } from '@nestjs/common';
// import { Crud } from '@nestjsx/crud';
import { PrismaCrud } from 'nestjs-crud-prisma';
import { UserService } from './user.service';
import { User } from '../../generated/type-graphql';

@PrismaCrud({
  model: {
    type: User
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
@Controller('users')
export class UserController {
  constructor(public service: UserService) {}
}
