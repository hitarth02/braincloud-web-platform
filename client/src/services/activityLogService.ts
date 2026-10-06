import api from "./api";
import { ActivityLogEntry, ApiResponse, PaginatedResult } from "../types";

export interface ActivityLogParams {
  scope?: "all" | "auth";
  page?: number;
  limit?: number;
}

export const activityLogService = {
  getLogs: async (params: ActivityLogParams = {}) => {
    const res = await api.get<ApiResponse<PaginatedResult<ActivityLogEntry>>>(
      "/activity-logs",
      { params }
    );
    return res.data.data;
  },
};
