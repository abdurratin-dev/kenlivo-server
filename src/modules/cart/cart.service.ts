import { AppError } from '../../utils/AppError.js';
import { Product } from '../product/product.model.js';
import { Cart } from './cart.model.js';

async function getOrCreateCart(userId: string) {
  return (await Cart.findOne({ user: userId })) ?? (await Cart.create({ user: userId, items: [] }));
}

function populated(userId: string) {
  return Cart.findOne({ user: userId }).populate('items.product', 'name slug price discountPercentage images stock');
}

export const cartService = {
  async get(userId: string) {
    return (await populated(userId)) ?? (await Cart.create({ user: userId, items: [] }));
  },

  async addItem(userId: string, productId: string, quantity: number) {
    const product = await Product.findById(productId);
    if (!product || !product.isActive) throw AppError.notFound('Product not found');
    if (product.stock < quantity) throw AppError.badRequest('Insufficient stock');

    const cart = await getOrCreateCart(userId);
    const existing = cart.items.find((i) => i.product.toString() === productId);
    if (existing) existing.quantity += quantity;
    else cart.items.push({ product: product._id, quantity });
    await cart.save();
    return populated(userId);
  },

  async updateItem(userId: string, productId: string, quantity: number) {
    const cart = await getOrCreateCart(userId);
    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) throw AppError.notFound('Item not in cart');
    item.quantity = quantity;
    await cart.save();
    return populated(userId);
  },

  async removeItem(userId: string, productId: string) {
    const cart = await getOrCreateCart(userId);
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();
    return populated(userId);
  },

  async clear(userId: string) {
    const cart = await getOrCreateCart(userId);
    cart.items = [];
    await cart.save();
    return cart;
  },
};
