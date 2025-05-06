import { NextFunction, Request, Response } from "express";
import { Role } from "../interfaces/models.interfaces";

export const adminRoute = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req;

  if (!user) {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }

  const allowedRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN];

  if (allowedRoles.includes(user.role)) {
    next();
  } else {
    return res.status(401).json({
      ok: false,
      message: 'Unauthorized'
    });
  }
}

export const publisherRoute = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req;

  if (!user) {
    return res.status(401).json({
      ok: false,
      message: 'Unauthorized'
    });
  }

  const allowedRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.PUBLISHER, Role.ADMIN_PUBLISHER, Role.ADMIN_DESIGN];

  if (allowedRoles.includes(user.role)) {
    next();
  } else {
    return res.status(401).json({
      ok: false,
      message: 'Unauthorized'
    });
  }
}

export const adminDesignRoute = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req;

  if (!user) {
    return res.status(401).json({
      ok: false,
      message: 'Unauthorized'
    });
  }

  const allowedRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.ADMIN_DESIGN];   

  if (allowedRoles.includes(user.role)) {
    next();
  } else {
    return res.status(401).json({
      ok: false,
      message: 'Unauthorized'
    });
  }
}