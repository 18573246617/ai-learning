import { Request, Response } from "express";
import { ok } from "../../utils/response";
import uploadService from "../../services/upload";


const uploadControllers = {
    upload: async (req: Request, res: Response) => {
        const data = await uploadService.upload(req);

        res.json(ok(data));
    },
};

export default uploadControllers;