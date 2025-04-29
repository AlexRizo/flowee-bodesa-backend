import { RequestHandler, Router } from "express";
import { verifyToken } from "../middlewares/JWT";
import { createUser, getAllUsers, deleteUser } from "../controllers/usersController";
import { adminRoute } from "../middlewares/protectedRoute";
import { body } from "express-validator";
import { expressValidator } from "../helpers/utils";
import { userValidation } from "../middlewares/UserValidation";

const router: Router = Router();

router.use(verifyToken as RequestHandler);
router.use(userValidation as RequestHandler);

router.get("/get/all",
  adminRoute as RequestHandler,
  getAllUsers as RequestHandler
);

router.post("/create", [
    body("name", "El nombre del usuario es requerido")
      .notEmpty()
      .isLength({ min: 3, max: 50 })
      .withMessage("El nombre del usuario debe tener entre 3 y 50 caracteres"),
    body("email", "El correo electrónico es requerido")
      .notEmpty()
      .isEmail()
      .withMessage("El correo electrónico no es válido"),
    body('password', 'La contraseña es requerida')
      .notEmpty()
      .isLength({ min: 10, max: 50 })
      .withMessage("La contraseña debe tener entre 10 y 50 caracteres"),
    body('role', 'El rol es requerido')
      .notEmpty()
      .isIn(['SUPER_ADMIN', 'ADMIN', 'ADMIN_DESIGN', 'ADMIN_PUBLISHER', 'PUBLISHER', 'DESIGNER'])
      .withMessage("El rol no es válido"),
    expressValidator as RequestHandler,
  ],
  adminRoute as RequestHandler,
  createUser as RequestHandler
);

router.patch('/delete/:id',
  adminRoute as RequestHandler,
  deleteUser as RequestHandler
);

export default router;
