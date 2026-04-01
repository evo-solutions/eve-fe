import { authAxiosService } from "./axios.service";
import type { AxiosError } from "axios";

export interface FaqItem {
  id: string;
  shopId: string;
  question: string;
  answer: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const faqsService = {
  async list(params?: {
    shopId?: string;
    includeDeleted?: boolean;
    limit?: number;
    search?: string;
    signal?: AbortSignal;
  }): Promise<FaqItem[]> {
    const { signal, ...query } = params ?? {};
    const { data } = await authAxiosService.get<FaqItem[]>("/faqs", {
      params: query,
      signal,
    });
    return data;
  },

  async createMany(items: {
    shopId: string;
    question: string;
    answer: string;
    isActive?: boolean;
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
      isActive?: boolean;
    },
  ): Promise<FaqItem> {
    try {
      const { data } = await authAxiosService.put<FaqItem>(`/faqs/${id}`, payload);
      return data;
    } catch (error) {
      const status = (error as AxiosError)?.response?.status;
      if (status !== 404 && status !== 405) {
        throw error;
      }
      const { data } = await authAxiosService.put<FaqItem[]>("/faqs/update", {
        items: [{ id, ...payload }],
      });
      return data[0];
    }
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
