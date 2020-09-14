import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const logger = console;
const prisma = new PrismaClient();
dotenv.config();
process.env = {
  ...process.env,
  ...dotenv.parse(fs.readFileSync(path.resolve(__dirname, '.env')))
};
const { env } = process;

(async () => {
  logger.log('seeding . . .');
  const fullnameArray = (env.SEED_ADMIN_FULLNAME || '').split(' ');
  const email = env.SEED_ADMIN_EMAIL;
  let firstname = fullnameArray.pop();
  let lastname = '';
  if (fullnameArray.length) {
    lastname = firstname!;
    firstname = fullnameArray.join(' ');
  }
  const users = await prisma.user.findMany({ first: 1 });
  if (users.length) {
    logger.log('already seeded');
  } else {
    const admin = await prisma.user.create({
      data: {
        email,
        firstname,
        lastname,
        password:
          '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // secret42
        role: 'ADMIN'
      }
    });
    logger.log({ admin: { ...admin, password: '***' } });
  }
  await prisma.disconnect();
})().catch(logger.error);
