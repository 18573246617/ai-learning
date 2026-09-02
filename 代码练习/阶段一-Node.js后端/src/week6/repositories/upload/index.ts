import { Request, } from "express";
const uploadRepositories = {
    upload: (req: Request) => {
        return req.file
    },
};

export default uploadRepositories;
