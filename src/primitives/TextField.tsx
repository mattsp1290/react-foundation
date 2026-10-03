import type { HTMLInputTypeAttribute, ReactNode } from 'react';

export function TextField({
  id,
  label,
  type,
  autoComplete,
  value,
  onChange,
  required,
  disabled,
  description,
  descriptionId = `${id}-description`,
}: {
  id: string;
  label: ReactNode;
  type?: HTMLInputTypeAttribute;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  description?: ReactNode;
  descriptionId?: string;
}) {
  const described = description !== undefined;
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={described ? descriptionId : undefined}
        required={required}
        disabled={disabled}
      />
      {described && <p id={descriptionId}>{description}</p>}
    </>
  );
}
