import { z } from "zod";

export const uuidParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID"),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Category name is required"),
    description: z.string().optional(),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    specification: z.string().optional(),
    sku: z.string().min(2),
    price: z.number().nonnegative(),
    costPrice: z.number().nonnegative(),
    quantity: z.number().int().nonnegative().optional(),
    unit: z.string().min(1).optional(),
    reorderLevel: z.number().int().nonnegative().optional(),
    categoryId: z.string().uuid("Invalid category ID"),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID"),
  }),
  body: z
    .object({
      name: z.string().min(2).optional(),
      specification: z.string().optional(),
      sku: z.string().min(2).optional(),
      price: z.number().nonnegative().optional(),
      costPrice: z.number().nonnegative().optional(),
      quantity: z.number().int().nonnegative().optional(),
      unit: z.string().min(1).optional(),
      reorderLevel: z.number().int().nonnegative().optional(),
      categoryId: z.string().uuid("Invalid categoryId").optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const listProductsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
  }),
});

// Shared UUID param schema
export const productIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID"),
  }),
});

// POST /products/:id/adjust-stock
export const adjustStockSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID"),
  }),
  body: z
    .object({
      type: z.enum(["STOCK_IN", "STOCK_OUT", "ADJUSTMENT"]),
      // STOCK_IN/STOCK_OUT => must be > 0
      // ADJUSTMENT => can be positive or negative, but not zero
      quantity: z.number().int(),
      reason: z.string().min(3, "Reason is required"),
    })
    .superRefine((data, ctx) => {
      if (
        (data.type === "STOCK_IN" || data.type === "STOCK_OUT") &&
        data.quantity <= 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Quantity must be greater than 0 for STOCK_IN/STOCK_OUT",
          path: ["quantity"],
        });
      }

      if (data.type === "ADJUSTMENT" && data.quantity === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Quantity cannot be 0 for ADJUSTMENT",
          path: ["quantity"],
        });
      }
    }),
});

// GET /products/:id/transactions?page=1&limit=20&type=STOCK_OUT
export const listProductTransactionsSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    type: z.enum(["STOCK_IN", "STOCK_OUT", "ADJUSTMENT"]).optional(),
  }),
});
