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
import { is, th } from "zod/locales";

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
        role: user.role, // ✅ Add this
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

  async updateUser(id: string, data: UserUpdateInput): Promise<UserResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    if (!existingUser) {
      throw new AppError(404, "User not found");
    }

    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new AppError(409, "Email already in use");
      }
    }

    if (data.username && data.username !== existingUser.username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username: data.username },
      });
      if (usernameExists) {
        throw new AppError(409, "Username already in use");
      }
    }

    const updateData: any = {
      username: data.username,
      email: data.email,
      contactNumber: data.contactNumber,
      address: data.address,
      role: data.role,
      isActive: data.isActive,
    };

    if (data.password) {
      updateData.passwordHash = await argon2.hash(data.password);
    }

    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    const updateUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
    return updateUser;
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    // Soft delete - set isActive to false
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: "User deleted successfully" };
  }

  // Optional: Hard delete method (use with caution)
  async hardDeleteUser(id: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    await prisma.user.delete({
      where: { id },
    });

    return { message: "User permanently deleted" };
  }
}
