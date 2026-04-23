// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authAPI.login({ username, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (e) {
      setError(e.response?.data?.message || "Invalid username or password");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      // Always send role: "USER" — backend also enforces this
      const { data } = await authAPI.register({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        role: "USER", // ← hardcoded, cannot be elevated via registration
      });
      return data;
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        Object.values(e.response?.data?.fieldErrors || {}).join(", ") ||
        "Registration failed";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // ── Role helpers ──────────────────────────────────────────────────────────
  const isAdmin = user?.role === "ADMIN";
  const isUser = user?.role === "USER";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        setError,
        login,
        register,
        logout,
        isAdmin,
        isUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
