import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, type User } from "@/store/authStore";
import { getToken, setToken, clearToken, isTokenValid } from "@/lib/auth";
import { apiClient } from "@/lib/api-client";

interface MeResponse {
  authenticated: boolean;
  user: { id: string; email: string };
}

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const login = useCallback(() => {
    const apiUrl =
      (import.meta.env.VITE_API_URL as string | undefined) ??
      "http://localhost:3001";
    window.location.href = `${apiUrl}/auth/google/login`;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // ignore logout errors — always clear local state
    } finally {
      clearToken();
      setUser(null);
      navigate("/auth", { replace: true });
    }
  }, [navigate]);

  const hydrateUser = useCallback(
    async (token: string) => {
      setToken(token);
      try {
        const data = await apiClient.get<MeResponse>("/auth/me");
        setUser(data.user);
        navigate("/dashboard", { replace: true });
      } catch {
        clearToken();
      }
    },
    [navigate],
  );

  useEffect(() => {
    const init = async () => {
      // 1. Check for ?token= in the URL — this is the OAuth callback landing
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("token");

      if (urlToken) {
        // Remove token from the URL bar immediately (before any async work)
        window.history.replaceState({}, "", window.location.pathname);
        await hydrateUser(urlToken);
        setIsLoading(false);
        return;
      }

      // 2. No URL token — check for an existing valid token in localStorage
      const storedToken = getToken();
      if (storedToken && isTokenValid(storedToken)) {
        try {
          const data = await apiClient.get<MeResponse>("/auth/me");
          setUser(data.user);
        } catch {
          // Token invalid or server error — wipe it
          clearToken();
        }
      }

      setIsLoading(false);
    };

    init();
  }, [hydrateUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
