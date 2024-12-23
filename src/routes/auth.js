import { Router } from "express";
import { AuthController } from "../controllers/auth.js";
const AuthRouter = () => {
  const authController = AuthController();

  const router = Router();

  router.post("/login", authController.login);

  return router;
};

export { AuthRouter };
