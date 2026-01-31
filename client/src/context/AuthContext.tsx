import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiClient } from "@/lib/api-client";

export interface User {
  _id: string;
  username: string;
  email: string;
  fullname: string;
  systemRole: "USER" | "ADMIN";
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    username: string,
    email: string,
    fullname: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient<{ user: User; accessToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const { user: loggedInUser, accessToken } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Login failed" };
    }
  };

  const register = async (username: string, email: string, fullname: string, password: string) => {
    try {
      await apiClient("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, fullname, password }),
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Registration failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const isAdmin = user?.systemRole === "ADMIN";

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
