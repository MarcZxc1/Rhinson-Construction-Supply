import { Router } from "express";
import { UserController } from "../controller/user.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  registerSchema,
  loginSchema,
  updateUserSchema,
  changePasswordSchema,
  getUserByIdSchema,
} from "../utils/zodSchema.js";
import { authenticate } from "../middleware/jwt.middleware.js";

const router = Router();
const userController = new UserController();

// Public routes
router.post(
  "/register",
  validateRequest(registerSchema),
  userController.register.bind(userController),
);
router.post(
  "/login",
  validateRequest(loginSchema),
  userController.login.bind(userController),
);

// Protected routes
router.get(
  "/profile",
  authenticate, // Add authentication
  userController.getProfile.bind(userController),
);

router.patch(
  "/:id",
  authenticate, // Require authentication
  validateRequest(updateUserSchema),
  userController.updateUser.bind(userController),
);

router.delete(
  "/:id",
  authenticate, // Require authentication
  validateRequest(getUserByIdSchema),
  userController.deleteUser.bind(userController),
);

export default router;
