import { RequestHandler, Router } from "express";
import { login, logout, renewToken } from "../controllers/authController";
import { body } from "express-validator";
import { expressValidator } from "../helpers/utils";
import { verifyToken } from "../middlewares/JWT";
import { userValidation } from "../middlewares/UserValidation";

const Route: Router = Router();

Route.post("/login",
  [
    body("email", "El email es requerido").notEmpty(),
    body("email", "El email debe ser un correo electrónico válido").isEmail(),
    body("password", "La contraseña es requerida").notEmpty(),
    expressValidator,
  ],
  login as RequestHandler
);

Route.use(verifyToken as RequestHandler);
Route.use(userValidation as RequestHandler);

Route.get("/renew", renewToken as RequestHandler);

Route.get("/logout", logout as RequestHandler);

export default Route;
