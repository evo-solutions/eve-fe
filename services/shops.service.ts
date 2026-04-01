import { authAxiosService } from "./axios.service";
import type { AxiosError } from "axios";

export interface ShopItem {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShopInput {
  name: string;
  description?: string;
  isActive?: boolean;
}

export const shopsService = {
  async list(params?: {
    userId?: string;
    includeDeleted?: boolean;
    limit?: number;
    search?: string;
    isActive?: boolean;
    signal?: AbortSignal;
  }): Promise<ShopItem[]> {
    const { signal, ...query } = params ?? {};
    const { data } = await authAxiosService.get<ShopItem[]>("/shops", {
      params: query,
      signal,
    });
    return data;
  },
  async detail(id: string): Promise<ShopItem> {
    const { data } = await authAxiosService.get<ShopItem>(`/shops/${id}`);
    return data;
  },
  async createManyForUser(
    userId: string,
    items: CreateShopInput[],
  ): Promise<ShopItem[]> {
    const { data } = await authAxiosService.post<ShopItem[]>("/shops/create", {
      items: items.map((item) => ({
        userId,
        name: item.name,
        description: item.description,
        isActive: item.isActive,
      })),
    });
    return data;
  },
  async update(id: string, payload: CreateShopInput): Promise<ShopItem> {
    try {
      const { data } = await authAxiosService.put<ShopItem>(`/shops/${id}`, payload);
      return data;
    } catch (error) {
      const status = (error as AxiosError)?.response?.status;
      if (status !== 404 && status !== 405) {
        throw error;
      }
      const { data } = await authAxiosService.put<ShopItem[]>("/shops/update", {
        items: [{ id, ...payload }],
      });
      return data[0];
    }
  },
  async delete(id: string): Promise<void> {
    await authAxiosService.delete("/shops/delete", {
      data: { ids: [id] },
    });
  },
  async deleteMany(ids: string[]): Promise<void> {
    await authAxiosService.delete("/shops/delete", {
      data: { ids },
    });
  },
};
