import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { userController } from './user.controller.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', userController.listAll);
router.patch('/:id', userController.updateOne);
router.delete('/:id', userController.deleteOne);

export const userRoutes = router;
