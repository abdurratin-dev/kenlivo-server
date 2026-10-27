import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { categoryController } from './category.controller.js';
import { createCategorySchema, idParamSchema, updateCategorySchema } from './category.schema.js';

const router = Router();

router.get('/', categoryController.list);
router.get('/:id', validate({ params: idParamSchema }), categoryController.get);

router.use(authenticate, authorize('admin'));
router.post('/', validate({ body: createCategorySchema }), categoryController.create);
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateCategorySchema }),
  categoryController.update,
);
router.delete('/:id', validate({ params: idParamSchema }), categoryController.remove);

export const categoryRoutes = router;
