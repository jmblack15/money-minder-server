import { Router } from "express";
import { UsersController } from "../controllers/users.js";

const UsersRoutes = () => {
  const usersController = UsersController();
  const router = Router();

  router.post("/", usersController.createUser);

  return router;
};

export { UsersRoutes };
