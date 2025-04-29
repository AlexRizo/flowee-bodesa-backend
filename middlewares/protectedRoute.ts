import { NextFunction, Request, Response } from "express";

export const adminRoute = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req;

  if (!user) {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }

  const allowedRoles = ['SUPER_ADMIN', 'ADMIN'];

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

  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'PUBLISHER', 'ADMIN_PUBLISHER'];

  if (allowedRoles.includes(user.role)) {
    next();
  } else {
    return res.status(401).json({
      ok: false,
      message: 'Unauthorized'
    });
  }
}