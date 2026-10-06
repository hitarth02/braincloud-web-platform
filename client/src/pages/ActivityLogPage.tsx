import { useEffect, useState } from "react";
import { Card } from "../components/Card";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { Pagination } from "../components/Pagination";
import { Badge, roleBadgeColor } from "../components/Badge";
import { activityLogService } from "../services/activityLogService";
import { ActivityLogEntry, Pagination as PaginationType } from "../types";
import { ACTIVITY_ICONS } from "../utils/activityIcons";
import { timeAgo } from "../utils/format";

type Scope = "all" | "auth";

export const ActivityLogPage = () => {
  const [scope, setScope] = useState<Scope>("all");
  const [items, setItems] = useState<ActivityLogEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    activityLogService
      .getLogs({ scope, page, limit: 20 })
      .then((res) => {
        setItems(res.items);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  }, [scope, page]);

  const tabs: { value: Scope; label: string }[] = [
    { value: "all", label: "All Activity" },
    { value: "auth", label: "Logins Only" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-sm text-gray-500 mt-1">
          A full audit trail of actions taken across the system.
        </p>
      </div>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => {
              setScope(t.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              scope === t.value
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <LoadingSpinner label="Loading activity..." />
        ) : items.length === 0 ? (
          <EmptyState title="No activity yet" description="Actions across the system will show up here." />
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((log) => {
              const { icon: Icon, color } = ACTIVITY_ICONS[log.action];
              return (
                <li key={log._id} className="px-6 py-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-gray-800 flex-1 min-w-0">
                    <span className="font-medium">
                      {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : "A deleted account"}
                    </span>{" "}
                    {log.message.charAt(0).toLowerCase() + log.message.slice(1)}
                  </p>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge label={log.actorRole} color={roleBadgeColor(log.actorRole)} />
                    <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(log.createdAt)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
      </Card>
    </div>
  );
};
