import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllUsers() {
  try {
    // Удаляем все связанные данные
    await prisma.$transaction([
      prisma.postLike.deleteMany(),
      prisma.comment.deleteMany(),
      prisma.post.deleteMany(),
      prisma.follow.deleteMany(),
      prisma.favorite.deleteMany(),
      prisma.userFavorite.deleteMany(),
      prisma.galleryImage.deleteMany(),
      prisma.service.deleteMany(),
      prisma.review.deleteMany(),
      prisma.product.deleteMany(),
      prisma.account.deleteMany(),
      prisma.session.deleteMany(),
      prisma.verificationToken.deleteMany(),
      // В конце удаляем самих пользователей
      prisma.user.deleteMany(),
    ]);

    console.log('Все пользователи и связанные данные успешно удалены');
  } catch (error) {
    console.error('Ошибка при удалении пользователей:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllUsers(); 