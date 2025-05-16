import { RequestHandler, Router } from "express";
import { expressValidator, multerUpload } from "../helpers/utils";
import { verifyToken } from "../middlewares/JWT";
import { createRequest, getRequests, updateRequestStatus, getMyRequests, getRequest } from "../controllers/requestController";
import { publisherRoute } from "../middlewares/protectedRoute";
import { body } from "express-validator";
import { multerErrorHandler } from "../middlewares/multer";
import { Status } from "../models/RequestModel";

const router = Router();

router.use(verifyToken as RequestHandler);

router.post("/create",
  publisherRoute as RequestHandler,
  multerUpload.fields([
    { name: 'files', maxCount: 5 },
    { name: 'referenceFiles', maxCount: 5 },
  ]),
  multerErrorHandler,
  [
    body('title', 'El título es requerido')
      .notEmpty()
      .isLength({ min: 5, max: 100 })
      .withMessage('El título debe tener entre 5 y 100 caracteres'),
    body('description', 'La descripción es requerida')
      .notEmpty()
      .isLength({ min: 10, max: 1000 })
      .withMessage('La descripción debe tener entre 10 y 1000 caracteres'),
    body('finishDate', 'La fecha de finalización es requerida')
      .notEmpty()
      .isISO8601().withMessage('La fecha de finalización debe ser una fecha válida')
      .toDate(),
    // body('board', 'El tablero es requerido')
    //   .notEmpty()
    //   .isSlug(),
    body('size', 'las medidas son requeridas')
      .notEmpty()
      .isLength({ min: 1, max: 100 }),
    expressValidator,
  ],
  createRequest as RequestHandler
);

router.get("/get-my-requests", getMyRequests as RequestHandler);

router.get("/single/:requestId", getRequest as RequestHandler);

router.get("/by-board/:boardSlug", getRequests as RequestHandler);

router.patch("/:requestId", [
  body('status', 'El estado es requerido')
    .notEmpty()
    .isIn(Object.values(Status)),
  expressValidator,
], updateRequestStatus as RequestHandler);

export default router;
