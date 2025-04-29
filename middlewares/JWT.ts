import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { getEnv } from "../helpers/getEnv";
import { IUserPayload } from "../interfaces/JWT-interface";

export const generateToken = async (user: IUserPayload): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(user, getEnv.SECRET_JWT_KEY, { expiresIn: "24h" }, (err, token) => {
      if (err) {
        console.error(err);
        reject('Ha ocurrido un error al generar el token');
      };
      resolve(token as string);
    });
  });
};


export const sendCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: getEnv.NODE_ENV !== 'development', 
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'strict',
  });
};

export const verifyToken = (req?: Request, res?: Response, next?: NextFunction): Response | void => {
  const { token } = req?.cookies as { token: string };

  if (!token) {
    return res!.status(401).json({
      message: 'Se esperaba un token en la petición, pero no se encontró',
      ok: false,
    });
  }

  try {
    const user: IUserPayload = jwt.verify(token, getEnv.SECRET_JWT_KEY) as IUserPayload;

    req!.user = user;
    next!();
  } catch (error) {
    console.error(error);
    res!.status(500).json({
      ok: false,
      message: 'Ha ocurrido un error interno (Error en el servidor [500]).',
    });
  }
  
}