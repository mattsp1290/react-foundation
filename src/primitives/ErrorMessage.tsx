import type { ReactNode } from 'react';

/** `live` announces the message; pass `live={false}` for static error text. */
export function ErrorMessage({
  children,
  live = true,
}: {
  children: ReactNode;
  live?: boolean;
}) {
  return (
    <p className="error" role={live ? 'alert' : undefined}>
      {children}
    </p>
  );
}
