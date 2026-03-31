const isBrowser = () => typeof window !== "undefined";

export class TokenStorage {
  private static ACCESS_TOKEN_KEY = "access_token";
  private static REFRESH_TOKEN_KEY = "refresh_token";

  // Access token
  static getAccessToken(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static setAccessToken(token: string) {
    if (!isBrowser()) return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  static removeAccessToken() {
    if (!isBrowser()) return;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
  }

  // Refresh token
  static getRefreshToken(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string) {
    if (!isBrowser()) return;
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static removeRefreshToken() {
    if (!isBrowser()) return;
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // Clear all
  static clearTokens() {
    if (!isBrowser()) return;
    this.removeAccessToken();
    this.removeRefreshToken();
  }
}