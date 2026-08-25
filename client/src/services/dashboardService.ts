import api from "./api";
import {
  AdminDashboardStats,
  ApiResponse,
  StaffDashboardStats,
  UserDashboardStats,
} from "../types";

export const dashboardService = {
  getAdmin: async () => {
    const res = await api.get<ApiResponse<AdminDashboardStats>>(
      "/dashboard/admin"
    );
    return res.data.data;
  },
  getStaff: async () => {
    const res = await api.get<ApiResponse<StaffDashboardStats>>(
      "/dashboard/staff"
    );
    return res.data.data;
  },
  getUser: async () => {
    const res = await api.get<ApiResponse<UserDashboardStats>>(
      "/dashboard/user"
    );
    return res.data.data;
  },
};
