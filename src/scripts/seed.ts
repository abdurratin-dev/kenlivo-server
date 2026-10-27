/* Seeds an admin user, a few categories and products. Run: npm run seed */
import { connectDB, disconnectDB } from '../config/db.js';
import { logger } from '../config/logger.js';
import { User } from '../modules/user/user.model.js';
import { Category } from '../modules/category/category.model.js';
import { Product } from '../modules/product/product.model.js';
import { slugify } from '../utils/slugify.js';

async function seed() {
  await connectDB();

  const adminEmail = 'admin@kenlivo.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'Kenlivo Admin',
      email: adminEmail,
      password: 'Admin@123',
      role: 'admin',
    });
    logger.info(`Created admin: ${adminEmail} / Admin@123`);
  }

  const categoryNames = ['Electronics', 'Fashion', 'Home & Living', 'Beauty'];
  const categories = await Promise.all(
    categoryNames.map((name) =>
      Category.findOneAndUpdate(
        { slug: slugify(name) },
        { name, slug: slugify(name) },
        { upsert: true, new: true },
      ),
    ),
  );

  const sample = [
    { name: 'Wireless Headphones', price: 120, category: categories[0], stock: 50 },
    { name: 'Smart Watch', price: 199, discountPercentage: 10, category: categories[0], stock: 30 },
    { name: 'Cotton T-Shirt', price: 25, category: categories[1], stock: 200 },
    { name: 'Ceramic Mug Set', price: 35, category: categories[2], stock: 80 },
    { name: 'Vitamin C Serum', price: 45, discountPercentage: 15, category: categories[3], stock: 120 },
  ];

  for (const p of sample) {
    await Product.findOneAndUpdate(
      { slug: slugify(p.name) },
      {
        name: p.name,
        slug: slugify(p.name),
        description: `${p.name} — quality product from Kenlivo.`,
        tagline: 'Best seller',
        price: p.price,
        discountPercentage: p.discountPercentage ?? 0,
        category: p.category!._id,
        images: [],
        stock: p.stock,
      },
      { upsert: true, new: true },
    );
  }

  logger.info('Seed complete ✅');
  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  logger.error('Seed failed', err instanceof Error ? err.stack : err);
  process.exit(1);
});
