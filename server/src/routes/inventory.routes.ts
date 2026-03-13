import { Router, Request, Response, NextFunction } from "express";
import { User, UserRole } from "@prisma/client";
import { InventoryController } from "../controller/inventory.controller.js";
import { authenticate } from "../middleware/jwt.middleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createCategorySchema,
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  uuidParamSchema,
  adjustStockSchema,
  listProductTransactionsSchema,
} from "../utils/inventory.schema.js";
import { AppError } from "../middleware/errorHandler.js";

const router = Router();
const inventoryController = new InventoryController();

const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "Unauthorized"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "Forbidden"));
    }
    next();
  };
};

// Categories
router.post(
  "/categories",
  authenticate,
  authorizeRoles("ADMIN", "MANAGER"),
  validateRequest(createCategorySchema),
  inventoryController.createCategory.bind(inventoryController),
);

router.get(
  "/categories",
  authenticate,
  inventoryController.getCategories.bind(inventoryController),
);

// Products
router.post(
  "/products",
  authenticate,
  authorizeRoles("ADMIN", "MANAGER"),
  validateRequest(createProductSchema),
  inventoryController.createProduct.bind(inventoryController),
);

router.get(
  "/products",
  authenticate,
  validateRequest(listProductsQuerySchema),
  inventoryController.getProducts.bind(inventoryController),
);

router.get(
  "/products/:id",
  authenticate,
  validateRequest(uuidParamSchema),
  inventoryController.getProductById.bind(inventoryController),
);

router.patch(
  "/products/:id",
  authenticate,
  authorizeRoles("ADMIN", "MANAGER"),
  validateRequest(updateProductSchema),
  inventoryController.updateProduct.bind(inventoryController),
);

router.post(
  "/products/:id/adjust-stock",
  authenticate,
  authorizeRoles("ADMIN", "MANAGER"),
  validateRequest(adjustStockSchema),
  inventoryController.adjustStock.bind(inventoryController),
);

// View product stock history (authenticated)
router.get(
  "/products/:id/transactions",
  authenticate,
  validateRequest(listProductTransactionsSchema),
  inventoryController.getProductTransactions.bind(inventoryController),
);

export default router;
