export interface CreateCategoryInput {
  name: string;
  description?: string;
}
export interface CreateProductInput {
  name: string;
  specification: string;
  sku: string;
  price: number;
  costPrice: number;
  quantity?: number;
  unit?: string;
  reorderLevel?: number;
  categoryId: string;
}
export interface ProductEditableFields {
  name: string;
  specification: string;
  sku: string;
  price: number;
  costPrice: number;
  quantity: number;
  unit: string;
  reorderLevel: number;
  categoryId: string;
}
export interface ProductEditableListQuery {
  page: number;
  limit: number;
  search: string; // name/sku/specification search
  categoryId: string;
  lowStockOnly: boolean; // quantity <= reorderLevel
  sortBy: "name" | "price" | "quantity" | "createdAt";
  sortOrder: "asc" | "desc";
}

export type UpdateProductInput = Partial<ProductEditableFields>;
export type ProductListQuery = Partial<ProductEditableListQuery>;
