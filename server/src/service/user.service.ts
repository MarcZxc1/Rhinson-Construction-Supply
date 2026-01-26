import prisma from "../utils/prisma.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { AppError } from "../middleware/errorHandler.js";
import {
  UserCreateInput,
  UserUpdateInput,
  UserResponse,
  LoginInput,
  LoginResponse,
} from "../types/user.types.js";
import { th } from "zod/locales";

export class UserService {
  async createUser(data: UserCreateInput): Promise<UserResponse> {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: data.email,
            username: data.username,
          },
        ],
      },
    });
    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new AppError(409, "Email already exist");
      }
      throw new AppError(409, "Username already exist");
    }

    const passwordHash = await argon2.hash(data.password);
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash: passwordHash,
        contactNumber: data.contactNumber || null,
        address: data.address || null,
        role: data.role,
      },
      select: {
        id: true,
        username: true,
        email: true,
        contactNumber: true,
        address: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return user;
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(401, "Invalid credentials");
    }

    const isValid = await argon2.verify(user.passwordHash, password);
    if (!isValid) {
      throw new AppError(401, "Invalid Credentials");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET || "supersekreto",
      { expiresIn: "7d" },
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        userName: user.username,
      },
      token,
    };
  }
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return user;
  }
}
