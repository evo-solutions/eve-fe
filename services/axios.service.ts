import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { TokenStorage } from "@/libs/ultils/tokenStorage";
import { authService } from "./auth.service";
import { getErrorMessage, getSuccessMessage } from "@/libs/ultils/apiMessage";
import { getGlobalMessageApi } from "@/libs/antd/messageBridge";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3030/api";

const createAxiosInstance = (config?: AxiosRequestConfig): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    ...config,
  });

  return instance;
};

const isMutationMethod = (method?: string) => {
  const normalized = (method ?? "get").toLowerCase();
  return (
    normalized === "post" ||
    normalized === "put" ||
    normalized === "patch" ||
    normalized === "delete"
  );
};

const shouldShowToast = (config?: AxiosRequestConfig) => {
  const skipToast = (config as AxiosRequestConfig & { skipToast?: boolean } | undefined)
    ?.skipToast;
  return isMutationMethod(config?.method) && !skipToast;
};

const attachMutationToastInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (typeof window !== "undefined" && shouldShowToast(response.config)) {
        getGlobalMessageApi()?.success(getSuccessMessage(response.data, "Success"));
      }
      return response;
    },
    (error) => {
      const config = error?.config as AxiosRequestConfig | undefined;
      const status = error?.response?.status;

      if (
        typeof window !== "undefined" &&
        shouldShowToast(config) &&
        status !== 401
      ) {
        getGlobalMessageApi()?.error(getErrorMessage(error, "Request failed"));
      }

      return Promise.reject(error);
    }
  );
};

// Client cho các API public, không cần auth
export const publicAxiosService = (() => {
  const instance = createAxiosInstance();
  attachMutationToastInterceptor(instance);
  return instance;
})();

// Client cho các API cần auth (Bearer token)
export const authAxiosService: AxiosInstance = (() => {
  const instance = createAxiosInstance();
  attachMutationToastInterceptor(instance);

  instance.interceptors.request.use((request: InternalAxiosRequestConfig) => {
    const token = TokenStorage.getAccessToken();
    if (token) {
      request.headers = request.headers ?? {};
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error?.response?.status;
      const originalRequest: InternalAxiosRequestConfig & {
        _retry?: boolean;
      } = error.config;

      if (status === 401 && !originalRequest._retry) {
        const refreshToken = TokenStorage.getRefreshToken();

        if (!refreshToken) {
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          const refreshed = await authService.refreshToken();
          const newAccessToken = refreshed.accessToken;

          instance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Retry đúng 1 lần với token mới
          return instance(originalRequest);
        } catch (refreshError) {
          TokenStorage.clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
})();

