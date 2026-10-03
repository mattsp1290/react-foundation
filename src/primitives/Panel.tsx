import type { ReactNode } from 'react';

export function Panel({
  heading,
  headingId,
  className,
  children,
}: {
  heading: ReactNode;
  headingId: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={className ? `panel ${className}` : 'panel'}
      aria-labelledby={headingId}
    >
      <h1 id={headingId}>{heading}</h1>
      {children}
    </section>
  );
}
