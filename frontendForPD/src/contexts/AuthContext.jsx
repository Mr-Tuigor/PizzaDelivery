import { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  console.log("Inside AuthContext");
  api("/auth/me")
    .then((data) => setUser(data.user))
    .catch(() => setUser(null))
    .finally(() => setLoading(false));
}, []);

  const login = async (email, password) => {
    const data = await api("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setUser(data.user);
  };

  const register = async (username, email, password) => {
    const data = await api("/auth/register", {
      method: "POST",
      body: { username, email, password },
    });
    return data.message || "Registration successful! Check your email for verification.";
  };

  const logout = async () => {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAdmin: user?.role === "admin" }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    console.warn("useAuth used outside AuthProvider");
    return {};
  }

  return ctx;
}
