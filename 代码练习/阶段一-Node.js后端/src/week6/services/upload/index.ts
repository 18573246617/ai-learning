import uploadRepositories from "../../repositories/upload/index.js";
import { AppError } from "../../utils/errors.js";
import { Request, } from "express";
const uploadService = {
    upload: async (req: Request,) => {
        if (!req.file) {
            throw new AppError(400, 'FILE_REQUIRED', '没有文件上传');
        }

        return await uploadRepositories.upload(req);
    },

};

export default uploadService;
