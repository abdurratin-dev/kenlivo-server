import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { cartController } from './cart.controller.js';
import { addItemSchema, productParamSchema, updateItemSchema } from './cart.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', cartController.get);
router.post('/items', validate({ body: addItemSchema }), cartController.addItem);
router.patch(
  '/items/:productId',
  validate({ params: productParamSchema, body: updateItemSchema }),
  cartController.updateItem,
);
router.delete('/items/:productId', validate({ params: productParamSchema }), cartController.removeItem);
router.delete('/', cartController.clear);

export const cartRoutes = router;
