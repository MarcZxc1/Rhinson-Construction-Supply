import { Request, Response, NextFunction } from "express";
import { UserService } from "../service/user.service.js";
import { AppError } from "../middleware/errorHandler.js";
import { UserCreateInput, RegisterResponse } from "../types/user.types.js";
import { success } from "zod";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        username,
        email,
        password,
        contactNumber,
        address,
        role,
      }: UserCreateInput = req.body;

      const user = await this.userService.createUser({
        username,
        email,
        password,
        contactNumber,
        address,
        role,
      });

      res.status(201).json({
        status: "sucess",
        message: "User registered successfully",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await this.userService.login(email, password);

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      throw new AppError(401, "Invalid credentials");
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (req.user?.id !== id && req.user?.role !== "ADMIN") {
        throw new AppError(403, "Forbidden");
      }

      const updatedUser = await this.userService.updateUser(
        id as string,
        updateData,
      );
      res.status(200).json({
        status: "success",
        message: "User updated successfully",
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Optional: Authorization check
      // Prevent users from deleting their own account (or allow only admins)
      if (req.user?.id === id) {
        throw new AppError(400, "Cannot delete your own account");
      }

      if (req.user?.role !== "ADMIN") {
        throw new AppError(403, "Forbidden: Only admins can delete users");
      }

      const result = await this.userService.deleteUser(id as string);

      res.status(200).json({
        status: "success",
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(404, "user not found");
      }
      const user = await this.userService.getUserById(userId);
      res.status(200).json({
        status: success,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}
