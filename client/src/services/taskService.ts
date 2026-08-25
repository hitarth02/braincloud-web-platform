import api from "./api";
import { ApiResponse, PaginatedResult, Task, TaskPriority, TaskStatus } from "../types";

export interface TaskListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatus | "";
  priority?: TaskPriority | "";
}

export interface TaskFormData {
  title: string;
  description: string;
  assignedTo: string;
  priority: TaskPriority;
  dueDate: string;
}

export const taskService = {
  getAll: async (params: TaskListParams) => {
    const res = await api.get<ApiResponse<PaginatedResult<Task>>>("/tasks", {
      params,
    });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return res.data.data;
  },
  create: async (data: TaskFormData) => {
    const res = await api.post<ApiResponse<Task>>("/tasks", data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<TaskFormData>) => {
    const res = await api.put<ApiResponse<Task>>(`/tasks/${id}`, data);
    return res.data.data;
  },
  remove: async (id: string) => {
    await api.delete(`/tasks/${id}`);
  },
  updateStatus: async (id: string, status: TaskStatus) => {
    const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}/status`, {
      status,
    });
    return res.data.data;
  },
};
