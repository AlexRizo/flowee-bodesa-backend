import { Request, Response } from "express";
import { User, UserInterface } from "../models/UserModel";
import { comparePassword } from "../helpers/utils";
import { generateToken, sendCookie } from "../middlewares/JWT";

export const login = async (req: Request, res: Response): Promise<Response | void> => {
  const { email, password }: { email: string; password: string } = req.body;

  try {
    const user: UserInterface | null = await User.findOne({ email, deleted: false });
  
    if (!user || !comparePassword(password, user.password)) {
      return res.status(401).json({
        ok: false,
        message: "Usuario y/o contraseña incorrectos",
      });
    }
  
    if (!user.active) {
      return res.status(401).json({
        ok: false,
        message: "Acceso denegado: Cuenta inactiva",
      });
    }
  
    const token: string = await generateToken({
      id: user.id,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    });

    sendCookie(res, token);
    
    return res.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: 'Ha ocurrido un error interno (Error en el servidor [500]).',
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<Response | void> => {
  res.clearCookie('token');

  return res.json({
    ok: true,
    message: 'Sesión terminada',
  });
}

export const renewToken = async (req: Request, res: Response): Promise<Response | void> => {
  const { user } = req;

  try {
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "El token no es válido",
      });
    }

    const DBUser = await User.findById(user.id).select('id name role deleted active avatar');

    if (!DBUser || DBUser.deleted || !DBUser.active) {
      res.clearCookie('token');
      return res.status(401).json({
        ok: false,
        message: "Usuario desconocido",
      });
    }

    const token: string = await generateToken({
      id: DBUser.id,
      name: DBUser.name,
      role: DBUser.role,
      avatar: DBUser.avatar,
    });

    sendCookie(res, token);

    return res.json({
      ok: true,
      user: {
        id: DBUser.id,
        name: DBUser.name,
        role: DBUser.role,
        avatar: DBUser.avatar,
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: 'Ha ocurrido un error interno (Error en el servidor [500]).',
    });
  }
} 
