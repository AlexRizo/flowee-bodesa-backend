import { Request, Response } from "express";

export type RequestController = (req: Request, res: Response) => Promise<Response | void>;
