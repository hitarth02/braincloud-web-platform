import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Download } from "lucide-react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { reportService } from "../services/reportService";
import { userService, staffService } from "../services/userService";
import { downloadBlob } from "../utils/download";
import { User } from "../types";

type TargetRole = "USER" | "STAFF";

export const ReportExportPage = () => {
  const { user } = useAuth();
  const [targetRole, setTargetRole] = useState<TargetRole>("USER");
  const [targetId, setTargetId] = useState("");
  const [options, setOptions] = useState<User[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [exporting, setExporting] = useState(false);

  const isUser = user?.role === "USER";
  const isStaff = user?.role === "STAFF";
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (isUser) return;
    if (isStaff && targetRole === "STAFF") {
      setTargetId(user!.id);
      return;
    }
    const service = targetRole === "STAFF" ? staffService : userService;
    service.getAll({ limit: 100 }).then((res) => {
      setOptions(res.items);
      setTargetId(res.items[0]?.id || "");
    });
  }, [targetRole, isUser, isStaff]);

  const handleExport = async () => {
    const effectiveRole = isUser ? "USER" : targetRole;
    const effectiveTargetId = isUser ? user!.id : targetId;

    if (!effectiveTargetId) {
      toast.error("Select who the report is for");
      return;
    }

    setExporting(true);
    try {
      const blob = await reportService.exportCsv({
        role: effectiveRole,
        targetId: effectiveTargetId,
        from: from || undefined,
        to: to || undefined,
      });
      downloadBlob(blob, `report-${effectiveRole.toLowerCase()}-${effectiveTargetId}.csv`);
      toast.success("Report downloaded");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export Report</h1>
        <p className="text-sm text-gray-500 mt-1">
          Download a CSV of task activity and progress for a chosen period (defaults to the last 7 days).
        </p>
      </div>

      <Card className="p-6 space-y-4">
        {isUser && (
          <p className="text-sm text-gray-600">
            This exports your own weekly task report.
          </p>
        )}

        {!isUser && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Report For</label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setTargetRole("USER")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  targetRole === "USER" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                A User
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setTargetRole("STAFF")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    targetRole === "STAFF" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  A Staff Member
                </button>
              )}
              {isStaff && (
                <button
                  type="button"
                  onClick={() => setTargetRole("STAFF")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    targetRole === "STAFF" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Myself
                </button>
              )}
            </div>

            {!(isStaff && targetRole === "STAFF") && (
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {options.length === 0 && <option value="">No accounts found</option>}
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.firstName} {o.lastName}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">From (optional)</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">To (optional)</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleExport} loading={exporting}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </Card>
    </div>
  );
};
