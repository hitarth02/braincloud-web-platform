import api from "./api";
import { ApiResponse, User } from "../types";

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post<ApiResponse<LoginResponse>>("/auth/login", {
      email,
      password,
    });
    return res.data.data;
  },
  logout: async () => {
    await api.post("/auth/logout");
  },
  getMe: async () => {
    const res = await api.get<ApiResponse<User>>("/auth/me");
    return res.data.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await api.post<ApiResponse<null>>("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return res.data;
  },
};
