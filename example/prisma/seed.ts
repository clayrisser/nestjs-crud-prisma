import { seed } from 'prisma-scripts';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const { env } = process;

(async () => {
  const fullnameArray = (env.SEED_ADMIN_FULLNAME || '').split(' ');
  const email = env.SEED_ADMIN_EMAIL || '';
  let firstname = fullnameArray.pop();
  let lastname = '';
  if (fullnameArray.length) {
    lastname = firstname!;
    firstname = fullnameArray.join(' ');
  }
  await seed(
    {
      user: {
        email,
        firstname,
        lastname,
        password:
          '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // secret42
        role: 'ADMIN'
      }
    },
    ['user.password']
  );
})();
