export const backendUrl =
  config.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL;

export interface FormInputType {
  label: string;
  required?: boolean;
  id: string;
  modelValue: string;
  note?: string;
  tooltip?: string;
}

export interface FromGridColumnType {
  label: string;
  required?: boolean;
  id: string;
  tooltip?: string;
  type: string;
  options?: Array<{ value: string; label: string }>;
}
