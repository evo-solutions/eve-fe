import { authAxiosService } from "./axios.service";

export interface FaqItem {
  id: string;
  shopId: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

export const faqsService = {
  async list(params?: {
    shopId?: string;
    includeDeleted?: boolean;
    limit?: number;
    search?: string;
  }): Promise<FaqItem[]> {
    const { data } = await authAxiosService.get<FaqItem[]>("/faqs", { params });
    return data;
  },

  async createMany(items: {
    shopId: string;
    question: string;
    answer: string;
  }[]): Promise<FaqItem[]> {
    const { data } = await authAxiosService.post<FaqItem[]>("/faqs/create", {
      items,
    });
    return data;
  },
  async update(
    id: string,
    payload: {
      question?: string;
      answer?: string;
    },
  ): Promise<FaqItem> {
    const { data } = await authAxiosService.patch<FaqItem>(`/faqs/${id}`, payload);
    return data;
  },
  async delete(id: string): Promise<void> {
    await authAxiosService.delete("/faqs/delete", {
      data: { ids: [id] },
    });
  },
  async deleteMany(ids: string[]): Promise<void> {
    await authAxiosService.delete("/faqs/delete", {
      data: { ids },
    });
  },
};
