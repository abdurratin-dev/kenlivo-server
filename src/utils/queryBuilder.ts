import type { FilterQuery, Model } from 'mongoose';

export interface QueryOptions {
  page?: string | number;
  limit?: string | number;
  sort?: string;
  fields?: string;
  search?: string;
  [key: string]: unknown;
}

const RESERVED = new Set(['page', 'limit', 'sort', 'fields', 'search']);

/**
 * Reusable list helper: filtering, full-text-ish search, sorting, field
 * selection and pagination for any Mongoose model.
 */
export class QueryBuilder<T> {
  private query: Record<string, unknown>;
  private model: Model<T>;
  private searchableFields: string[];
  private page = 1;
  private limit = 20;

  constructor(model: Model<T>, query: QueryOptions, searchableFields: string[] = []) {
    this.model = model;
    this.query = { ...query };
    this.searchableFields = searchableFields;
  }

  private buildFilter(): FilterQuery<T> {
    const filter: Record<string, unknown> = {};

    // Direct equality / range filters (supports field[gte]=, field[lte]= style via dotted keys).
    for (const [key, value] of Object.entries(this.query)) {
      if (RESERVED.has(key) || value === undefined || value === '') continue;
      const rangeMatch = key.match(/^(.+)\[(gte|gt|lte|lt|ne|in)\]$/);
      if (rangeMatch) {
        const [, field, op] = rangeMatch;
        filter[field] = {
          ...(filter[field] as object),
          [`$${op}`]: op === 'in' ? String(value).split(',') : Number(value),
        };
      } else {
        filter[key] = value;
      }
    }

    const search = this.query.search as string | undefined;
    if (search && this.searchableFields.length) {
      filter.$or = this.searchableFields.map((field) => ({
        [field]: { $regex: search, $options: 'i' },
      }));
    }

    return filter as FilterQuery<T>;
  }

  async execute() {
    const filter = this.buildFilter();

    this.page = Math.max(1, Number(this.query.page) || 1);
    this.limit = Math.min(100, Math.max(1, Number(this.query.limit) || 20));
    const skip = (this.page - 1) * this.limit;

    const sort = (this.query.sort as string | undefined)?.split(',').join(' ') ?? '-createdAt';
    const fields = (this.query.fields as string | undefined)?.split(',').join(' ');

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort(sort)
        .select(fields ?? '')
        .skip(skip)
        .limit(this.limit)
        .lean(),
      this.model.countDocuments(filter),
    ]);

    return {
      data,
      meta: {
        page: this.page,
        limit: this.limit,
        total,
        totalPages: Math.ceil(total / this.limit) || 1,
      },
    };
  }
}
