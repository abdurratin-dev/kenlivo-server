import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { orderController } from './order.controller.js';
import {
  createOrderSchema,
  idParamSchema,
  listOrdersQuerySchema,
  updateStatusSchema,
} from './order.schema.js';

const router = Router();

router.use(authenticate);

// Customer endpoints
router.post('/', validate({ body: createOrderSchema }), orderController.create);
router.get('/me', validate({ query: listOrdersQuerySchema }), orderController.listMine);
router.get('/:id', validate({ params: idParamSchema }), orderController.get);
router.patch('/:id/cancel', validate({ params: idParamSchema }), orderController.cancel);

// Admin endpoints
router.get('/', authorize('admin'), validate({ query: listOrdersQuerySchema }), orderController.listAll);
router.patch(
  '/:id/status',
  authorize('admin'),
  validate({ params: idParamSchema, body: updateStatusSchema }),
  orderController.updateStatus,
);

export const orderRoutes = router;
