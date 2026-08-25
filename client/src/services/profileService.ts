import api from "./api";
import { ApiResponse, User } from "../types";

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export const profileService = {
  get: async () => {
    const res = await api.get<ApiResponse<User>>("/profile");
    return res.data.data;
  },
  update: async (data: ProfileUpdateData) => {
    const res = await api.put<ApiResponse<User>>("/profile", data);
    return res.data.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await api.post<ApiResponse<null>>("/profile/change-password", {
      currentPassword,
      newPassword,
    });
    return res.data;
  },
};
