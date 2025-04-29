import { RequestHandler, Router } from "express";
import { createBoard, getAllBoards, getBoardById, getBoardBySlug, getUserBoards, getBoardUsers, deleteUserFromBoard, getUsersToAdd, AddUsersToBoard } from "../controllers/boardController";
import { verifyToken } from "../middlewares/JWT";
import { adminRoute } from "../middlewares/protectedRoute";
import { body } from "express-validator";
import { expressValidator } from "../helpers/utils";
import { userValidation } from "../middlewares/UserValidation";

const router: Router = Router();

router.use(verifyToken as RequestHandler);
router.use(userValidation as RequestHandler);

router.post("/create",
  adminRoute as RequestHandler,
  [
    body("name", "El nombre del tablero es requerido")
      .notEmpty()
      .isLength({ min: 3, max: 50 })
      .withMessage("El nombre del tablero debe tener entre 3 y 50 caracteres"),
    body("slug", "El slug del tablero es requerido")
      .notEmpty()
      .isLength({ min: 3, max: 10 })
      .withMessage("El slug del tablero debe tener entre 3 y 10 caracteres"),
      expressValidator as RequestHandler,
    ],
  createBoard as RequestHandler
);

router.get("/get/all",
  adminRoute as RequestHandler,
  getAllBoards as RequestHandler
);

router.get("/get-by-slug/:slug", getBoardBySlug as RequestHandler);

router.get("/get-by-id/:id", getBoardById as RequestHandler);

// ? Obtener los tableros del usuario autenticado
router.get("/get-user-boards", getUserBoards as RequestHandler);

// ? Obtener los usuarios de un tablero por su slug
router.get("/get-board-users/:slug", getBoardUsers as RequestHandler);

// ? Eliminar un usuario de un tablero
router.patch('/remove/:userId/from/:boardSlug', 
  adminRoute as RequestHandler,
  deleteUserFromBoard as RequestHandler
);

// ? Obtener los usuarios que se pueden agregar a un tablero
router.get('/:boardSlug/available-users', 
  adminRoute as RequestHandler,
  getUsersToAdd as RequestHandler
);

router.post('/:boardSlug/add-users',
  adminRoute as RequestHandler,
  [
    body('users', 'Los usuarios a agregar son requeridos')
      .notEmpty()
      .isArray()
      .withMessage('Los usuarios a agregar deben ser un array'),
    body('users.*', 'El usuario a agregar es requerido')
      .notEmpty()
      .isMongoId()
      .withMessage('El usuario a agregar debe ser un id válido'),
    expressValidator as RequestHandler,
  ],
  AddUsersToBoard as RequestHandler
);

export default router;
