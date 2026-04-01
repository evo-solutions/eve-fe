import { authAxiosService } from "./axios.service";
import type { AxiosError } from "axios";

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
    signal?: AbortSignal;
  }): Promise<ProductItem[]> {
    const { signal, ...query } = params ?? {};
    const { data } = await authAxiosService.get<ProductItem[]>("/products", {
      params: query,
      signal,
    });
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
    try {
      const { data } = await authAxiosService.put<ProductItem>(`/products/${id}`, payload);
      return data;
    } catch (error) {
      const status = (error as AxiosError)?.response?.status;
      if (status !== 404 && status !== 405) {
        throw error;
      }
      const { data } = await authAxiosService.put<ProductItem[]>("/products/update", {
        items: [{ id, ...payload }],
      });
      return data[0];
    }
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
