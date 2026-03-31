"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";

export function useUsers(search?: string) {
  return useInfiniteQuery({
    queryKey: ["users", { search: search ?? "" }],
    queryFn: ({ pageParam }) =>
      usersService.listUsers({
        search: search || undefined,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
        limit: 20,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 60 * 1000,
  });
}
