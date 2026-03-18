import { useContext } from "react";
import { AuthContext } from "@/store/authStore";
import type { AuthContextValue } from "@/store/authStore";

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
