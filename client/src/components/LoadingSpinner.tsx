import { Loader2 } from "lucide-react";

export const LoadingSpinner = ({ label = "Loading..." }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
    <Loader2 className="w-6 h-6 animate-spin" />
    <p className="text-sm">{label}</p>
  </div>
);
