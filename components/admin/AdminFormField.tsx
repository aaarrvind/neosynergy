"use client";

interface FieldProps {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}

export function AdminFormField({ label, name, required, type = "text", value, onChange, placeholder, hint }: FieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-graphite">
        {label} {required && <span className="text-spark">*</span>}
      </span>
      {hint && <span className="text-xs text-graphite/50">{hint}</span>}
      <input type={type} name={name} required={required} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="rounded-md border border-steel-200 px-3 py-2 text-sm text-graphite focus:border-cyan focus:outline-none" />
    </label>
  );
}

interface CheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}

export function AdminCheckboxField({ label, name, checked, onChange, hint }: CheckboxProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded border-steel-200 text-cyan-deep accent-cyan-deep focus:outline-none focus:ring-1 focus:ring-cyan"
      />
      <span className="flex flex-col gap-1">
        <span className="text-sm font-medium text-graphite">{label}</span>
        {hint && <span className="text-xs text-graphite/50">{hint}</span>}
      </span>
    </label>
  );
}

interface TextareaProps {
  label: string;
  name: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}

export function AdminTextareaField({ label, name, required, value, onChange, placeholder, rows = 4, hint }: TextareaProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-graphite">
        {label} {required && <span className="text-spark">*</span>}
      </span>
      {hint && <span className="text-xs text-graphite/50">{hint}</span>}
      <textarea name={name} required={required} value={value} rows={rows} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="rounded-md border border-steel-200 px-3 py-2 text-sm text-graphite focus:border-cyan focus:outline-none" />
    </label>
  );
}
