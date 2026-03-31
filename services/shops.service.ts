import { authAxiosService } from "./axios.service";

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
    includeDeleted?: boolean;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<ShopItem[]> {
    const { data } = await authAxiosService.get<ShopItem[]>("/shops", { params });
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
    const { data } = await authAxiosService.patch<ShopItem>(`/shops/${id}`, payload);
    return data;
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
