# nestjs-crud-prisma

[![GitHub stars](https://img.shields.io/github/stars/codejamninja/nestjs-crud-prisma.svg?style=social&label=Stars)](https://github.com/clayrisser/nestjs-crud-prisma)

> crud for restful apis built with nestjs and prisma

Please ★ this repo if you found it useful ★ ★ ★

Though not required, nestjs-crud-prisma works best with [typegraphql-prisma](https://www.npmjs.com/package/type-graphql)

## Installation

```sh
npm install --save nestjs-crud-prisma
```

## Dependencies

- [NodeJS](https://nodejs.org)

## Usage

1. Setup prisma to support generating typegraphql.

   > This step is not required but recommended. Typegraphql will generate the models from the _schema.prisma_.

   _[schema.prisma](example/prisma/schema.prisma)_

   ```
   generator typegraphql {
     provider = "../node_modules/typegraphql-prisma/generator.js"
     output   = "../src/generated/type-graphql"
   }
   ```

2. Create a service that injects the prisma service.

   > Although it's not required, I recommend [nestjs-prisma](https://www.npmjs.com/package/nestjs-prisma) to get the prisma service.
   > Also, notice I'm getting the model from the generated typegraphql.

   _[user.service.ts](example/src/modules/user/user.service.ts)_

   ```ts
   import { Injectable } from '@nestjs/common';
   import { PrismaCrudService } from 'nestjs-crud-prisma';
   import { PrismaService } from 'nestjs-prisma';
   import { User } from '../../generated/type-graphql';

   @Injectable()
   export class UserService extends PrismaCrudService<User> {
     constructor(prisma: PrismaService) {
       super(prisma, User); // make sure you pass in the model
     }
   }
   ```

3. Create a crud controller that injects the previous service.

   _[user.controller.ts](example/src/modules/user/user.controller.ts)_

   ```ts
   import { Controller } from '@nestjs/common';
   import { Crud } from '@nestjsx/crud';
   import { UserService } from './user.service';
   import { User } from '../../generated/type-graphql';

   @Crud({
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
   ```

## Support

Submit an [issue](https://github.com/codejamninja/nestjs-crud-prisma/issues/new)

## Screenshots

[Contribute](https://github.com/codejamninja/nestjs-crud-prisma/blob/master/CONTRIBUTING.md) a screenshot

## Contributing

Review the [guidelines for contributing](https://github.com/codejamninja/nestjs-crud-prisma/blob/master/CONTRIBUTING.md)

## License

[MIT License](https://github.com/codejamninja/nestjs-crud-prisma/blob/master/LICENSE)

[Jam Risser](https://codejam.ninja) © 2020

## Changelog

Review the [changelog](https://github.com/codejamninja/nestjs-crud-prisma/blob/master/CHANGELOG.md)

## Credits

- [Jam Risser](https://codejam.ninja) - Author

## Support on Liberapay

A ridiculous amount of coffee ☕ ☕ ☕ was consumed in the process of building this project.

[Add some fuel](https://liberapay.com/codejamninja/donate) if you'd like to keep me going!

[![Liberapay receiving](https://img.shields.io/liberapay/receives/codejamninja.svg?style=flat-square)](https://liberapay.com/codejamninja/donate)
[![Liberapay patrons](https://img.shields.io/liberapay/patrons/codejamninja.svg?style=flat-square)](https://liberapay.com/codejamninja/donate)
