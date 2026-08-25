import { Inbox } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <Inbox className="w-6 h-6 text-gray-400" />
    </div>
    <p className="text-sm font-medium text-gray-700">{title}</p>
    {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
