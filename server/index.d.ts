import { Request } from "express";
import { IUserPayload } from "../interfaces/JWT-interface";

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
    }
  }
}

export {};