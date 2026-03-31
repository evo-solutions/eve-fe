import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { TokenStorage } from "@/libs/ultils/tokenStorage";

export interface AuthUser {
    id: string;
    name: string;
}

export const useAuth = () => {
    const hasToken =
        typeof window !== "undefined" &&
        !!TokenStorage.getRefreshToken();

    const {
        data: user,
        isLoading,
        isError,
        refetch,
    } = useQuery<AuthUser | null>({
        queryKey: ["auth", "me"],
        queryFn: async () => {
            try {
                const me = await authService.getProfile<AuthUser>();
                return me;
            } catch {
                return null;
            }
        },
        enabled: hasToken,
        staleTime: 5 * 60 * 1000,
    });

    const isAuthenticated = !!user && !isError;

    return {
        user,
        isAuthenticated,
        isLoading,
        isError,
        refetch,
    };
};
