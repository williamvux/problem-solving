import { Router } from 'express';
import { container } from '../../shared/container';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { TaskController } from './task.controller';

const router = Router();
const ctrl = container.resolve(TaskController);

router.post('/', asyncHandler(ctrl.create));
router.get('/', asyncHandler(ctrl.list));
router.get('/:id', asyncHandler(ctrl.get));
router.patch('/:id', asyncHandler(ctrl.update));
router.delete('/:id', asyncHandler(ctrl.remove));

export default router;
