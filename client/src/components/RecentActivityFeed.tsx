import { Card } from "./Card";
import { EmptyState } from "./EmptyState";
import { ActivityItem } from "../types";
import { ACTIVITY_ICONS } from "../utils/activityIcons";
import { timeAgo } from "../utils/format";

interface RecentActivityFeedProps {
  items: ActivityItem[];
}

export const RecentActivityFeed = ({ items }: RecentActivityFeedProps) => (
  <Card>
    <div className="px-6 py-4 border-b border-gray-100">
      <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
    </div>
    {items.length === 0 ? (
      <EmptyState title="No activity yet" description="Actions across the system will show up here." />
    ) : (
      <ul className="divide-y divide-gray-100">
        {items.map((item, index) => {
          const { icon: Icon, color } = ACTIVITY_ICONS[item.type];
          return (
            <li key={index} className="px-6 py-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-sm text-gray-700 flex-1">{item.message}</p>
              <span className="text-xs text-gray-400 shrink-0">{timeAgo(item.timestamp)}</span>
            </li>
          );
        })}
      </ul>
    )}
  </Card>
);
