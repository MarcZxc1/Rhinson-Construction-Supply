import { Request, Response, NextFunction } from "express";
import jwt, { Jwt } from "jsonwebtoken";
import { AppError } from "./errorHandler.js";

interface JwtPayload {
  id: string;
  email: string;
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
  } catch (error) {
    next(new AppError(401, "Invalid or expired token"));
  }
};
