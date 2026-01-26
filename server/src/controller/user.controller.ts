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
