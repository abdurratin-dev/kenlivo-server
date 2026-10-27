import { model, Schema, Types, type HydratedDocument } from 'mongoose';

export const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ['cash_on_delivery', 'card', 'online'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  price: number; // unit price captured at purchase time
  quantity: number;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  postalCode?: string;
  country: string;
}

export interface IOrder {
  user: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: PaymentMethod;
  itemsTotal: number;
  shippingFee: number;
  grandTotal: number;
  status: OrderStatus;
  isPaid: boolean;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderDocument = HydratedDocument<IOrder>;

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: 'cash_on_delivery' },
    itemsTotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
  },
  { timestamps: true },
);

export const Order = model<IOrder>('Order', orderSchema);
