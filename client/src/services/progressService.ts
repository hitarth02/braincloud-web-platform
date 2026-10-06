import api from "./api";
import { ApiResponse, PaginatedResult, TaskProgressNote } from "../types";

export interface ProgressFeedParams {
  page?: number;
  limit?: number;
}

export const progressService = {
  addForTask: async (taskId: string, note: string) => {
    const res = await api.post<ApiResponse<TaskProgressNote>>(
      `/tasks/${taskId}/progress`,
      { note }
    );
    return res.data.data;
  },
  listForTask: async (taskId: string) => {
    const res = await api.get<ApiResponse<TaskProgressNote[]>>(
      `/tasks/${taskId}/progress`
    );
    return res.data.data;
  },
  getMyFeed: async (params: ProgressFeedParams = {}) => {
    const res = await api.get<ApiResponse<PaginatedResult<TaskProgressNote>>>(
      "/progress/me",
      { params }
    );
    return res.data.data;
  },
  getTeamFeed: async (params: ProgressFeedParams = {}) => {
    const res = await api.get<ApiResponse<PaginatedResult<TaskProgressNote>>>(
      "/progress/team",
      { params }
    );
    return res.data.data;
  },
};
