import { Request, Response, NextFunction } from "express";
import jwt, { Jwt } from "jsonwebtoken";
import { AppError } from "./errorHandler.js";
import { UserRole } from "@prisma/client";

interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      throw new AppError(401, "No token provided");
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersekreto",
    ) as JwtPayload;

    req.user = decoded; // Attach user to request
    next(); // Call next middleware
  } catch (error) {
    next(new AppError(401, "Invalid or expired token"));
  }
};
