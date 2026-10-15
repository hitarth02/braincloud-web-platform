import api from "./api";
import { ApiResponse, PaginatedResult, User } from "../types";

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive" | "";
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
}

/**
 * Users and Staff are managed via near-identical REST endpoints
 * (/api/users and /api/staff) that differ only in base path, since both
 * are backed by the same User collection filtered by role on the server.
 */
export const createUserService = (basePath: "/users" | "/staff") => ({
  getAll: async (params: UserListParams) => {
    const res = await api.get<ApiResponse<PaginatedResult<User>>>(basePath, {
      params,
    });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await api.get<ApiResponse<User>>(`${basePath}/${id}`);
    return res.data.data;
  },
  create: async (data: UserFormData) => {
    const res = await api.post<ApiResponse<User>>(basePath, data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<UserFormData & { isActive: boolean }>) => {
    const res = await api.put<ApiResponse<User>>(`${basePath}/${id}`, data);
    return res.data.data;
  },
  remove: async (id: string) => {
    const res = await api.delete<ApiResponse<User>>(`${basePath}/${id}`);
    return res.data.data;
  },
  resetPassword: async (id: string, newPassword: string) => {
    const res = await api.post<ApiResponse<null>>(
      `${basePath}/${id}/reset-password`,
      { newPassword }
    );
    return res.data;
  },
  // Admin-only; only meaningful on /api/users (hands a User off to a
  // different Staff member).
  reassignOwner: async (id: string, newOwnerId: string) => {
    const res = await api.put<ApiResponse<User>>(`${basePath}/${id}/reassign`, {
      newOwnerId,
    });
    return res.data.data;
  },
});

export const userService = createUserService("/users");
export const staffService = createUserService("/staff");
