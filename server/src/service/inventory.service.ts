import prisma from "../utils/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

export class InventoryService {
  async createCategory(data: { name: string; description?: string }) {
    const existing = await prisma.category.findUnique({
      where: { name: data.name },
    });
    if (existing) throw new AppError(409, "Category already exists");

    return prisma.category.create({
      data: { name: data.name, description: data.description ?? null },
    });
  }

  async getCategories() {
    return prisma.category.findMany({ orderBy: { createdAt: "desc" } });
  }

  async createProduct(data: {
    name: string;
    specification?: string;
    sku: string;
    price: number;
    costPrice: number;
    quantity?: number;
    unit?: string;
    reorderLevel?: number;
    categoryId: string;
  }) {
    const skuExists = await prisma.product.findUnique({
      where: { sku: data.sku },
    });
    if (skuExists) throw new AppError(409, "SKU already exists");

    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) throw new AppError(404, "Category not found");

    return prisma.product.create({
      data: {
        name: data.name,
        specification: data.specification ?? null,
        sku: data.sku,
        price: data.price,
        costPrice: data.costPrice,
        quantity: data.quantity ?? 0,
        unit: data.unit ?? "pcs",
        reorderLevel: data.reorderLevel ?? 10,
        categoryId: data.categoryId,
      },
      include: { category: true },
    });
  }

  async getProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      AND: [
        params.categoryId ? { categoryId: params.categoryId } : {},
        params.search
          ? {
              OR: [
                {
                  name: {
                    contains: params.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  sku: {
                    contains: params.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  specification: {
                    contains: params.search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {},
      ],
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    const withStockFlag = items.map((p) => ({
      ...p,
      isLowStock: p.quantity <= p.reorderLevel,
    }));

    return {
      items: withStockFlag,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) throw new AppError(404, "Product not found");

    return { ...product, isLowStock: product.quantity <= product.reorderLevel };
  }

  async updateProduct(
    id: string,
    data: Partial<{
      name: string;
      specification: string;
      sku: string;
      price: number;
      costPrice: number;
      quantity: number;
      unit: string;
      reorderLevel: number;
      categoryId: string;
    }>,
  ) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "Product not found");

    if (data.sku && data.sku !== existing.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: data.sku },
      });
      if (skuExists) throw new AppError(409, "SKU already exists");
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) throw new AppError(404, "Category not found");
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });

    return { ...updated, isLowStock: updated.quantity <= updated.reorderLevel };
  }
}
