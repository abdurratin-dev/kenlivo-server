import { model, Schema, Types, type HydratedDocument } from 'mongoose';

export interface IProduct {
  name: string;
  slug: string;
  description: string;
  tagline?: string;
  price: number;
  discountPercentage: number;
  category: Types.ObjectId;
  images: string[];
  stock: number;
  rating: number;
  numReviews: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductDocument = HydratedDocument<IProduct>;

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },
    tagline: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    images: { type: [String], default: [] },
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.index({ name: 'text', description: 'text', tagline: 'text' });

productSchema.virtual('finalPrice').get(function finalPrice(this: IProduct) {
  return Math.round(this.price * (1 - this.discountPercentage / 100) * 100) / 100;
});

export const Product = model<IProduct>('Product', productSchema);
