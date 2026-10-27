import { AppError } from '../../utils/AppError.js';
import { QueryBuilder, type QueryOptions } from '../../utils/queryBuilder.js';
import { slugify } from '../../utils/slugify.js';
import { Category } from './category.model.js';

export const categoryService = {
  async list(query: QueryOptions) {
    return new QueryBuilder(Category, query, ['name', 'description']).execute();
  },

  async getById(id: string) {
    const category = await Category.findById(id);
    if (!category) throw AppError.notFound('Category not found');
    return category;
  },

  async create(input: { name: string; description?: string; image?: string; isActive?: boolean }) {
    return Category.create({ ...input, slug: slugify(input.name) });
  },

  async update(id: string, input: Partial<{ name: string; description: string; image: string; isActive: boolean }>) {
    const update = { ...input, ...(input.name ? { slug: slugify(input.name) } : {}) };
    const category = await Category.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!category) throw AppError.notFound('Category not found');
    return category;
  },

  async remove(id: string) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw AppError.notFound('Category not found');
  },
};
