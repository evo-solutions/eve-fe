import { authAxiosService, publicAxiosService } from "./axios.service";
import { TokenStorage } from "@/libs/ultils/tokenStorage";

/** BE trả về camelCase: accessToken, refreshToken */
export interface SignInPayload {
    email: string;
    password: string;
}

export interface SignUpPayload {
    name: string;
    email: string;
    password: string;
}

/** Backend response: camelCase */
export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
}

export interface AuthResponse<TUser = unknown> {
    user?: TUser;
    accessToken: string;
    refreshToken?: string;
}

class AuthService {
    async signIn<TUser = unknown>(
        payload: SignInPayload
    ): Promise<AuthResponse<TUser>> {
        const { data } = await publicAxiosService.post<AuthResponse<TUser>>(
            "/auth/sign-in",
            payload
        );
        this.persistTokens(data);
        return data;
    }

    async signUp<TUser = unknown>(
        payload: SignUpPayload
    ): Promise<AuthResponse<TUser>> {
        const { data } = await publicAxiosService.post<AuthResponse<TUser>>(
            "/auth/sign-up",
            payload
        );
        this.persistTokens(data);
        return data;
    }

    async refreshToken(): Promise<AuthTokens> {
        const refreshToken = TokenStorage.getRefreshToken();
        if (!refreshToken) {
            throw new Error("No refresh token");
        }
        const { data } = await publicAxiosService.post<AuthResponse>(
            "/auth/refresh-token",
            { refreshToken }
        );
        this.persistTokens(data);
        return { accessToken: data.accessToken, refreshToken: data.refreshToken };
    }

    /** BE: GET /users/me */
    async getProfile<TUser = unknown>(): Promise<TUser> {
        const { data } = await authAxiosService.get<TUser>("/users/me");
        return data;
    }

    logout() {
        TokenStorage.clearTokens();
    }

    private persistTokens(tokens: {
        accessToken?: string;
        refreshToken?: string;
    }) {
        if (tokens.accessToken) {
            TokenStorage.setAccessToken(tokens.accessToken);
        }
        if (tokens.refreshToken) {
            TokenStorage.setRefreshToken(tokens.refreshToken);
        }
    }
}

export const authService = new AuthService();

