require('dotenv').config(); 

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {

  // 5 Dummy News
  const news = [];
  for (let i = 1; i <= 5; i++) {
    news.push({
      title: `News ${i}`,
      content: `Content for news ${i}`,
      author: `Author ${i}`,
      thumbnail: null,
      published: i % 2 == 0 ? true : false
    });
  }

  await prisma.news.createMany({ data: news });
  console.log('Seeding successful!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());