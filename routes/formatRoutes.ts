import { RequestHandler, Router } from "express";
import { verifyToken } from "../middlewares/JWT";
import { userValidation } from "../middlewares/UserValidation";
import { getFormats, createFormat, getCategories, searchCategories, createCategory } from "../controllers/formatController";
import { adminsRoute } from "../middlewares/protectedRoute";
const router = Router();

router.use(verifyToken as RequestHandler);
router.use(userValidation as RequestHandler);

router.get("/", adminsRoute as RequestHandler, getFormats);
router.get("/categories", adminsRoute as RequestHandler, getCategories);
router.get("/categories/search", adminsRoute as RequestHandler, searchCategories);

router.post("/", adminsRoute as RequestHandler, createFormat as RequestHandler);
router.post("/categories", adminsRoute as RequestHandler, createCategory as RequestHandler);

export default router;
