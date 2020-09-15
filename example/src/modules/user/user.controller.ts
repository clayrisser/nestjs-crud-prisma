import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { UserService } from './user.service';
import { User } from '../../generated/type-graphql';

@Crud({
  model: {
    type: User
  }
})
@Controller('users')
export class UserController {
  constructor(public service: UserService) {}
}
