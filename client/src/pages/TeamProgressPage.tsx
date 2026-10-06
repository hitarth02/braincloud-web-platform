import { useEffect, useState } from "react";
import { Card } from "../components/Card";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { Pagination } from "../components/Pagination";
import { ProgressNoteCard } from "../components/ProgressNoteCard";
import { useAuth } from "../hooks/useAuth";
import { progressService } from "../services/progressService";
import { Pagination as PaginationType, TaskProgressNote } from "../types";

interface TeamProgressPageProps {
  /** Route prefix for this viewer's task-detail pages, e.g. "/staff/tasks". */
  taskBasePath: string;
}

export const TeamProgressPage = ({ taskBasePath }: TeamProgressPageProps) => {
  const { user } = useAuth();
  const [items, setItems] = useState<TaskProgressNote[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    progressService
      .getTeamFeed({ page, limit: 15 })
      .then((res) => {
        setItems(res.items);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Progress Updates</h1>
        <p className="text-sm text-gray-500 mt-1">
          Daily progress notes posted by every user, newest first.
        </p>
      </div>

      <Card>
        {loading ? (
          <LoadingSpinner label="Loading progress updates..." />
        ) : items.length === 0 ? (
          <EmptyState
            title="No progress updates yet"
            description="Updates posted by users on their tasks will show up here."
          />
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((n) => (
              <ProgressNoteCard
                key={n._id}
                note={n}
                // Admin can open any task; Staff only has access to tasks
                // they personally created, so only link in that case.
                taskHref={
                  user?.role === "ADMIN" || n.task?.createdBy === user?.id
                    ? (id) => `${taskBasePath}/${id}`
                    : undefined
                }
              />
            ))}
          </ul>
        )}
        {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
      </Card>
    </div>
  );
};
