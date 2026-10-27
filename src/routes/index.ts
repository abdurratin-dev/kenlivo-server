import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { categoryRoutes } from '../modules/category/category.routes.js';
import { productRoutes } from '../modules/product/product.routes.js';
import { cartRoutes } from '../modules/cart/cart.routes.js';
import { orderRoutes } from '../modules/order/order.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', uptime: process.uptime() });
});

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);

export const apiRouter = router;
