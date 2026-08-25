import api from "./api";
import { ApiResponse, PaginatedResult, User } from "../types";

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementFormData {
  title: string;
  content: string;
}

export const announcementService = {
  getAll: async (params: { page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse<PaginatedResult<Announcement>>>(
      "/announcements",
      { params }
    );
    return res.data.data;
  },
  create: async (data: AnnouncementFormData) => {
    const res = await api.post<ApiResponse<Announcement>>(
      "/announcements",
      data
    );
    return res.data.data;
  },
  update: async (id: string, data: Partial<AnnouncementFormData>) => {
    const res = await api.put<ApiResponse<Announcement>>(
      `/announcements/${id}`,
      data
    );
    return res.data.data;
  },
  remove: async (id: string) => {
    await api.delete(`/announcements/${id}`);
  },
};
