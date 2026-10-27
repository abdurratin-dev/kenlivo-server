import mongoose from 'mongoose';
import { AppError } from '../../utils/AppError.js';
import { QueryBuilder, type QueryOptions } from '../../utils/queryBuilder.js';
import { Cart } from '../cart/cart.model.js';
import { Product } from '../product/product.model.js';
import type { UserRole } from '../user/user.model.js';
import { Order, type IOrderItem, type OrderStatus, type PaymentMethod } from './order.model.js';

const SHIPPING_FEE = 0; // flat fee; adjust or compute as needed

interface CreateOrderInput {
  items?: { product: string; quantity: number }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    postalCode?: string;
    country: string;
  };
  paymentMethod?: PaymentMethod;
}

export const orderService = {
  async create(userId: string, input: CreateOrderInput) {
    // Resolve the line items either from the payload or the user's cart.
    let requested = input.items;
    if (!requested || requested.length === 0) {
      const cart = await Cart.findOne({ user: userId });
      if (!cart || cart.items.length === 0) throw AppError.badRequest('Your cart is empty');
      requested = cart.items.map((i) => ({ product: i.product.toString(), quantity: i.quantity }));
    }

    const session = await mongoose.startSession();
    try {
      let created;
      await session.withTransaction(async () => {
        const orderItems: IOrderItem[] = [];
        let itemsTotal = 0;

        for (const line of requested!) {
          const product = await Product.findById(line.product).session(session);
          if (!product || !product.isActive) {
            throw AppError.badRequest(`Product ${line.product} is unavailable`);
          }
          if (product.stock < line.quantity) {
            throw AppError.badRequest(`Insufficient stock for "${product.name}"`);
          }

          const unitPrice =
            Math.round(product.price * (1 - product.discountPercentage / 100) * 100) / 100;
          itemsTotal += unitPrice * line.quantity;

          product.stock -= line.quantity;
          await product.save({ session });

          orderItems.push({
            product: product._id,
            name: product.name,
            price: unitPrice,
            quantity: line.quantity,
          });
        }

        itemsTotal = Math.round(itemsTotal * 100) / 100;

        const [order] = await Order.create(
          [
            {
              user: userId,
              items: orderItems,
              shippingAddress: input.shippingAddress,
              paymentMethod: input.paymentMethod ?? 'cash_on_delivery',
              itemsTotal,
              shippingFee: SHIPPING_FEE,
              grandTotal: itemsTotal + SHIPPING_FEE,
            },
          ],
          { session },
        );
        created = order;

        // Empty the cart after a successful checkout.
        await Cart.updateOne({ user: userId }, { $set: { items: [] } }, { session });
      });
      return created;
    } finally {
      await session.endSession();
    }
  },

  async listMine(userId: string, query: QueryOptions) {
    return new QueryBuilder(Order, { ...query, user: userId }).execute();
  },

  async listAll(query: QueryOptions) {
    return new QueryBuilder(Order, query).execute();
  },

  async getById(id: string, requester: { id: string; role: UserRole }) {
    const order = await Order.findById(id).populate('items.product', 'name slug images');
    if (!order) throw AppError.notFound('Order not found');
    if (requester.role !== 'admin' && order.user.toString() !== requester.id) {
      throw AppError.forbidden('You cannot access this order');
    }
    return order;
  },

  async updateStatus(id: string, status: OrderStatus) {
    const order = await Order.findById(id);
    if (!order) throw AppError.notFound('Order not found');
    order.status = status;
    if (status === 'paid' && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
    }
    await order.save();
    return order;
  },

  async cancel(id: string, requester: { id: string; role: UserRole }) {
    const order = await Order.findById(id);
    if (!order) throw AppError.notFound('Order not found');
    if (requester.role !== 'admin' && order.user.toString() !== requester.id) {
      throw AppError.forbidden('You cannot cancel this order');
    }
    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      throw AppError.badRequest(`Cannot cancel an order that is ${order.status}`);
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        for (const item of order.items) {
          await Product.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } },
            { session },
          );
        }
        order.status = 'cancelled';
        await order.save({ session });
      });
    } finally {
      await session.endSession();
    }
    return order;
  },
};
