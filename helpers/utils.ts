import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";

export const encryptPassword = (password: string): string => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

export const comparePassword = (password: string, hash: string): boolean => {
  return bcrypt.compareSync(password, hash);
};

export const multerProps = {
  FILE_SIZE: 1024 * 1024 * 25, // 5MB
  FILE_COUNT: 5,
  FILE_TYPES: [
    ".jpg",
    ".png",
    ".pdf",
    ".jpeg",
    ".gif",
    ".webp",
    ".heic",
    ".heif",
    ".mp3",
    ".mp4",
    ".mov",
    ".avi",
    ".wmv",
    ".mkv",
    ".flv",
    ".webm",
    ".zip",
    ".wav",
  ],
};

export const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: multerProps.FILE_SIZE, // 5MB
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (multerProps.FILE_TYPES.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido, debe ser una de las siguientes extensiones: ${multerProps.FILE_TYPES.join(", ")}`));
    }
  },
});

export const expressValidator = (req: Request, res: Response, next: NextFunction): Response | any => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorsString = errors.array().map((error) => error.msg).join(", ");
    console.error(errors.array());
    return res.status(400).json({
      ok: false,
      message: "Detalles: " + errorsString,
      errors: errors.array(),
    });
  }

  next();
};

export const globalQuery = {
  deleted: false,
  active: true,
}

export const RESULTS_PER_PAGE = 10;