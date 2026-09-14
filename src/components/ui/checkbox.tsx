import { InputHTMLAttributes } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({ className = '', onCheckedChange, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={`h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onChange={(e) => {
        if (onCheckedChange) {
          onCheckedChange(e.target.checked);
        }
        props.onChange?.(e);
      }}
      {...props}
    />
  );
}
