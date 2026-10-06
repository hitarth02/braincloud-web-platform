import api from "./api";
import { UserRole } from "../types";

export interface ExportReportParams {
  role: Extract<UserRole, "USER" | "STAFF">;
  targetId: string;
  from?: string;
  to?: string;
}

export const reportService = {
  exportCsv: async (params: ExportReportParams) => {
    const res = await api.get<Blob>("/reports/export", {
      params,
      responseType: "blob",
    });
    return res.data;
  },
};
