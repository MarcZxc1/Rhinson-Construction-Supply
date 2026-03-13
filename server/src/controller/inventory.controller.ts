import { Request, Response, NextFunction } from "express";
import { InventoryService } from "../service/inventory.service.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  CreateCategoryInput,
  CreateProductInput,
  UpdateProductInput,
  ProductListQuery,
} from "../types/inventory.types.js";

export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description }: CreateCategoryInput = req.body;

      const category = await this.inventoryService.createCategory({
        name,
        description,
      });

      res.status(201).json({
        status: "success",
        message: "Category created successfully",
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await this.inventoryService.getCategories();

      res.status(200).json({
        status: "success",
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        specification,
        sku,
        price,
        costPrice,
        quantity,
        unit,
        reorderLevel,
        categoryId,
      }: CreateProductInput = req.body;

      const product = await this.inventoryService.createProduct({
        name,
        specification,
        sku,
        price,
        costPrice,
        quantity,
        unit,
        reorderLevel,
        categoryId,
      });

      res.status(201).json({
        status: "success",
        message: "Product created successfully",
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const query: ProductListQuery = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        search: req.query.search ? String(req.query.search) : undefined,
        categoryId: req.query.categoryId
          ? String(req.query.categoryId)
          : undefined,
      };

      const result = await this.inventoryService.getProducts(query);

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!id) {
        throw new AppError(400, "Invalid product ID");
      }

      const product = await this.inventoryService.getProductById(id);

      res.status(200).json({
        status: "success",
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!id) {
        throw new AppError(400, "Invalid product ID");
      }

      const updateData: UpdateProductInput = req.body;
      const product = await this.inventoryService.updateProduct(id, updateData);

      res.status(200).json({
        status: "success",
        message: "Product updated successfully",
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }
}
