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

// Protected routes (add auth middleware later)
// router.get("/profile", userController.getProfile.bind(userController));
// router.get(
//   "/:id",
//   validateRequest(getUserByIdSchema),
//   userController.getUserById.bind(userController),
// );
// router.patch(
//   "/:id",
//   validateRequest(updateUserSchema),
//   userController.updateUser.bind(userController),
// );

export default router;
