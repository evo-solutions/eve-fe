import { authAxiosService } from "./axios.service";

export interface UserItem {
  id: string;
  userName: string;
}

export interface ListUsersResult {
  items: UserItem[];
  nextCursor: string | null;
}

async function listUsers(params?: {
  search?: string;
  cursor?: string;
  limit?: number;
}): Promise<ListUsersResult> {
  const { data } = await authAxiosService.get<ListUsersResult>("/users", {
    params,
  });
  return data;
}

export const usersService = { listUsers };
