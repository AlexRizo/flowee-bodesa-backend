import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { multerProps } from "../helpers/utils";

export const multerErrorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  // Si no hay error, continuar
  if (!err) {
    next();
    return;
  }
  
  // Limpiar la solicitud para evitar que quede colgada
  try {
    // Intentar abortar cualquier procesamiento pendiente
    if (req.socket && !req.socket.destroyed) {
      req.socket.removeAllListeners('data');
    }
    
    // Limpiar cualquier stream en progreso
    if (req.readable) {
      req.resume(); // Consume cualquier dato pendiente
    }
  } catch (cleanupErr) {
    console.error("Error al limpiar la solicitud:", cleanupErr);
  }
  
  // Manejar errores de Multer
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      console.error(err);
      res.status(400).json({
        ok: false,
        message: `El tamaño del archivo es demasiado grande. Máximo ${multerProps.FILE_SIZE / 1024 / 1024} MB`,
      });
      return;
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      console.error(err);
      res.status(400).json({
        ok: false,
        message: `Solo se permiten ${multerProps.FILE_COUNT} archivos`,
      });
      return;
    }

    // Error de multer no reconocido
    console.error("Error desconocido de multer:", err);
    res.status(400).json({
      ok: false,
      message: err.message || "Error al subir el archivo",
    });
    return;
  }
  
  // Manejar errores no-Multer (errores personalizados del fileFilter)
  if (err instanceof Error) {
    console.error(err);
    res.status(400).json({
      ok: false,
      message: err.message || "Error al subir el archivo",
    });
    return;
  }

  // Si el error no es de tipo reconocido, pasarlo al siguiente middleware
  next(err);
}
