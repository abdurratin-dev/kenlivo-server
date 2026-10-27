import type { QueryOptions } from '../../utils/queryBuilder.js';
import { QueryBuilder } from '../../utils/queryBuilder.js';
import { AppError } from '../../utils/AppError.js';
import { slugify } from '../../utils/slugify.js';
import { Category } from '../category/category.model.js';
import { Product } from './product.model.js';

async function assertCategoryExists(categoryId: string) {
  const exists = await Category.exists({ _id: categoryId });
  if (!exists) throw AppError.badRequest('Referenced category does not exist');
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let i = 1;
  while (await Product.exists({ slug })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export const productService = {
  async list(query: QueryOptions) {
    const builder = new QueryBuilder(Product, query, ['name', 'description', 'tagline']);
    const result = await builder.execute();
    return result;
  },

  async getById(id: string) {
    const product = await Product.findById(id).populate('category', 'name slug');
    if (!product) throw AppError.notFound('Product not found');
    return product;
  },

  async create(input: { name: string; category: string } & Record<string, unknown>) {
    await assertCategoryExists(input.category);
    return Product.create({ ...input, slug: await uniqueSlug(input.name) });
  },

  async update(id: string, input: Record<string, unknown>) {
    if (typeof input.category === 'string') await assertCategoryExists(input.category);
    const update = {
      ...input,
      ...(typeof input.name === 'string' ? { slug: await uniqueSlug(input.name) } : {}),
    };
    const product = await Product.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!product) throw AppError.notFound('Product not found');
    return product;
  },

  async remove(id: string) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) throw AppError.notFound('Product not found');
  },
};
