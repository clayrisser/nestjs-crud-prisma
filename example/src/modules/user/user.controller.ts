import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { User } from './user.entity';
import { UserService } from './user.service';

@Crud({
  model: {
    type: User
  }
})
@Controller('users')
export class UserController {
  constructor(public service: UserService) {}
}
