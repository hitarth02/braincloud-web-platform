import { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormInput = ({ label, error, className = "", ...rest }: FormInputProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    <input
      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
        error ? "border-red-400" : "border-gray-300"
      } ${className}`}
      {...rest}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);
