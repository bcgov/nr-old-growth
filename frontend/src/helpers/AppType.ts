export interface FormInputType {
  label: string;
  required?: boolean;
  id: string;
  modelValue: string;
  note?: string;
  info?: string;
}

export interface FromGridColumnType {
  label: string;
  required?: boolean;
  id: string;
  info?: string;
  type: string;
  options?: Array<{ value: string; label: string }>;
}
