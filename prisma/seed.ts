import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // デモセラーユーザーを作成
  const user = await prisma.user.upsert({
    where: { email: 'demo-seller@example.com' },
    update: {},
    create: {
      email: 'demo-seller@example.com',
      username: 'デモセラー',
      password: 'demo',
      role: 'seller'
    }
  });

  console.log('Created user:', user);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });