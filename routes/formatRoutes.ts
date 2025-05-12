import { RequestHandler, Router } from "express";
import { verifyToken } from "../middlewares/JWT";
import { userValidation } from "../middlewares/UserValidation";
import { getFormats, createFormat, getCategories, searchCategories, createCategory } from "../controllers/formatController";
import { adminsRoute } from "../middlewares/protectedRoute";
import { body } from "express-validator";
import { expressValidator } from "../helpers/utils";

const router = Router();

router.use(verifyToken as RequestHandler);
router.use(userValidation as RequestHandler);

router.get("/", adminsRoute as RequestHandler, getFormats);
router.get("/categories", adminsRoute as RequestHandler, getCategories);
router.get("/categories/search", adminsRoute as RequestHandler, searchCategories);

router.post("/", adminsRoute as RequestHandler, [
  body('name', 'El nombre es requerido')
    .notEmpty()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  body('slug', 'El slug es requerido')
    .notEmpty()
    .isSlug()
    .withMessage('El slug debe ser un slug válido'),
  body('description', 'La descripción es requerida')
    .notEmpty()
    .isLength({ min: 10, max: 500 })
    .withMessage('La descripción debe tener entre 10 y 500 caracteres'),
  body('belongsTo', 'La categoría es requerida')
    .optional()
    .isSlug()
    .withMessage('La categoría debe ser un slug válido'),
  expressValidator,

], createFormat as RequestHandler);
router.post("/categories", adminsRoute as RequestHandler, createCategory as RequestHandler);

export default router;
