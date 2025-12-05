require('dotenv').config(); 

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create Categories
  const cat1 = await prisma.category.create({ data: { name: 'Electronics' } });
  const cat2 = await prisma.category.create({ data: { name: 'Clothing' } });

  // 20 Dummy Products
  const products = [];
  for (let i = 1; i <= 20; i++) {
    products.push({
      name: `Product Dummy ${i}`,
      description: `Description for product ${i}`,
      price: i * 10000,
      categoryId: i % 2 === 0 ? cat1.id : cat2.id, // Alternate categories (Electronics, Clothing, Electronics, and so on..)
      image: null 
    });
  }

  await prisma.product.createMany({ data: products });
  console.log('Seeding successful: 2 categories and 20 products successfully created.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());