import { HTMLAttributes } from "react";

export const Card = ({
  className = "",
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}
    {...rest}
  >
    {children}
  </div>
);
