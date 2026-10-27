import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { productController } from './product.controller.js';
import {
  createProductSchema,
  idParamSchema,
  listProductsQuerySchema,
  updateProductSchema,
} from './product.schema.js';

const router = Router();

router.get('/', validate({ query: listProductsQuerySchema }), productController.list);
router.get('/:id', validate({ params: idParamSchema }), productController.get);

router.use(authenticate, authorize('admin'));
router.post('/', validate({ body: createProductSchema }), productController.create);
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateProductSchema }),
  productController.update,
);
router.delete('/:id', validate({ params: idParamSchema }), productController.remove);

export const productRoutes = router;
