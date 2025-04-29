import { Request, Response, NextFunction } from "express";
import { User } from "../models/UserModel";

export const userValidation = async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req;

  const dbUser = await User.findById(user?.id).select('deleted active');

  if (!dbUser || dbUser.deleted || !dbUser.active) {
    res.clearCookie('token');
    return res.status(401).json({
      ok: false,
      message: "Acceso denegado",
    });
  }
  
  next();
}
