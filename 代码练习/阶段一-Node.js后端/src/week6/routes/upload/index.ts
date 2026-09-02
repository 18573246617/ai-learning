import { Router } from 'express';
import asyncHandler from '../../utils/asyncHandler';
import uploadControllers from '../../controllers/upload';
import { createUpload } from '../../middleware/upload';

const fileUpload = createUpload();


const uploadRouter = Router();

uploadRouter.post('/file', fileUpload.single('file'), asyncHandler(uploadControllers.upload));

export default uploadRouter;
