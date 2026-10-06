import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Avatar } from "./Avatar";
import { TaskProgressNote } from "../types";
import { timeAgo } from "../utils/format";

interface ProgressNoteCardProps {
  note: TaskProgressNote;
  /** When provided (and the note's task hasn't been deleted), the card
   * becomes a link to that task — e.g. (id) => `/staff/tasks/${id}`. */
  taskHref?: (taskId: string) => string;
  /** Show "on <task title>" next to the author's name. Turn off when the
   * card is already rendered on that task's own detail page. */
  showTask?: boolean;
}

export const ProgressNoteCard = ({
  note,
  taskHref,
  showTask = true,
}: ProgressNoteCardProps) => {
  const isLinkable = !!taskHref && !!note.task;

  const body = (
    <div className="flex items-start gap-3">
      <Avatar
        firstName={note.user?.firstName ?? "?"}
        lastName={note.user?.lastName ?? ""}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-gray-900">
            {note.user ? `${note.user.firstName} ${note.user.lastName}` : "A deleted user"}
            {showTask && (
              <span className="text-gray-400 font-normal">
                {" "}on{" "}
                {note.task ? note.task.title : "a deleted task"}
              </span>
            )}
          </p>
          <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
            {timeAgo(note.createdAt)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap">{note.note}</p>
      </div>
      {isLinkable && <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1.5" />}
    </div>
  );

  if (isLinkable) {
    return (
      <Link
        to={taskHref!(note.task!._id)}
        className="block px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
      >
        {body}
      </Link>
    );
  }

  return <div className="px-4 py-3">{body}</div>;
};
