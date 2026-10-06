import { initials } from "../utils/format";

interface AvatarProps {
  firstName: string;
  lastName: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<string, string> = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-16 h-16 text-lg",
};

export const Avatar = ({ firstName, lastName, size = "md" }: AvatarProps) => (
  <div
    className={`${sizeClasses[size]} rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold shrink-0`}
  >
    {initials(firstName, lastName)}
  </div>
);
