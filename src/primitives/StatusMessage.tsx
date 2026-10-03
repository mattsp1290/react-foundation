import type { ReactNode } from 'react';

export function StatusMessage({ children }: { children: ReactNode }) {
  return <p role="status">{children}</p>;
}
