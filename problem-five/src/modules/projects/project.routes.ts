import { Router } from 'express';
import { container } from '../../shared/container';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { ProjectController } from './project.controller';

const router = Router();
const ctrl = container.resolve(ProjectController);

router.post('/', asyncHandler(ctrl.create));
router.get('/', asyncHandler(ctrl.list));
router.get('/:id', asyncHandler(ctrl.get));
router.patch('/:id', asyncHandler(ctrl.update));
router.delete('/:id', asyncHandler(ctrl.remove));

export default router;
