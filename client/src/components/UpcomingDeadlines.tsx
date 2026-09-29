import { Card } from "./Card";
import { EmptyState } from "./EmptyState";
import { Badge, priorityBadgeColor } from "./Badge";
import { UpcomingTask } from "../types";
import { daysUntil } from "../utils/format";

interface UpcomingDeadlinesProps {
  tasks: UpcomingTask[];
  showAssignee?: boolean;
}

const dueLabel = (dueDate: string) => {
  const days = daysUntil(dueDate);
  if (days <= 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
};

export const UpcomingDeadlines = ({ tasks, showAssignee = false }: UpcomingDeadlinesProps) => (
  <Card>
    <div className="px-6 py-4 border-b border-gray-100">
      <h2 className="text-base font-semibold text-gray-900">Upcoming Deadlines</h2>
    </div>
    {tasks.length === 0 ? (
      <EmptyState title="Nothing due soon" description="Tasks due in the next 7 days will show up here." />
    ) : (
      <ul className="divide-y divide-gray-100">
        {tasks.map((task) => (
          <li key={task._id} className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{task.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {dueLabel(task.dueDate)}
                {showAssignee && task.assignedTo && (
                  <> &middot; Assigned to {task.assignedTo.firstName} {task.assignedTo.lastName}</>
                )}
              </p>
            </div>
            <Badge label={task.priority} color={priorityBadgeColor(task.priority)} />
          </li>
        ))}
      </ul>
    )}
  </Card>
);
