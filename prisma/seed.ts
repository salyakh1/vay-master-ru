import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.message.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin',
      password: '$2a$12$kxZ7dOk3a9Zq5ZrKIEqwCOYz6TtxMQJqhN.B3UHw0K9mZBDPRK.rC', // "password123"
      role: 'ADMIN',
      city: 'Москва',
      isSetupComplete: true
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 