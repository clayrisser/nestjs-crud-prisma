import dotenv from 'dotenv';
import fs from 'fs';
import ora from 'ora';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const spinner = ora();
dotenv.config();
process.env = {
  ...process.env,
  ...dotenv.parse(fs.readFileSync(path.resolve(__dirname, '.env')))
};
const { env } = process;

(async () => {
  spinner.start('seeding');
  const fullnameArray = (env.SEED_ADMIN_FULLNAME || '').split(' ');
  const email = env.SEED_ADMIN_EMAIL || '';
  let firstname = fullnameArray.pop();
  let lastname = '';
  if (fullnameArray.length) {
    lastname = firstname!;
    firstname = fullnameArray.join(' ');
  }
  if (await prisma.user.count()) {
    spinner.info('already seeded');
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
    spinner.succeed('seeded');
    console.log({ admin: { ...admin, password: '***' } });
  }
  await prisma.$disconnect();
})().catch(spinner.fail);
