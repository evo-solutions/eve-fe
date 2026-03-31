import { authAxiosService } from "./axios.service";

export interface ProductItem {
  id: string;
  shopId: string;
  name: string;
  price: number;
  thumbnailUrl?: string | null;
  imageUrls?: string[] | null;
  searchContent?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const productsService = {
  async list(params?: {
    shopId?: string;
    includeDeleted?: boolean;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<ProductItem[]> {
    const { data } = await authAxiosService.get<ProductItem[]>("/products", { params });
    return data;
  },

  async createMany(items: {
    shopId: string;
    name: string;
    price: number;
    thumbnailUrl?: string;
    imageUrls?: string[];
    searchContent?: string;
    isActive?: boolean;
  }[]): Promise<ProductItem[]> {
    const { data } = await authAxiosService.post<ProductItem[]>("/products/create", {
      items,
    });
    return data;
  },
  async update(
    id: string,
    payload: {
      name?: string;
      price?: number;
      thumbnailUrl?: string;
      imageUrls?: string[];
      searchContent?: string;
      isActive?: boolean;
    },
  ): Promise<ProductItem> {
    const { data } = await authAxiosService.patch<ProductItem>(`/products/${id}`, payload);
    return data;
  },
  async delete(id: string): Promise<void> {
    await authAxiosService.delete("/products/delete", {
      data: { ids: [id] },
    });
  },
  async deleteMany(ids: string[]): Promise<void> {
    await authAxiosService.delete("/products/delete", {
      data: { ids },
    });
  },
};
