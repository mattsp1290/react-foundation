import type { ReactNode } from 'react';

/**
 * Page frame: masthead, main region and footer. `titleLink` is rendered as
 * given so the host keeps its own router link or anchor.
 */
export function AppShell({
  titleLink,
  footer,
  children,
}: {
  titleLink: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="app-shell">
      <header className="masthead">{titleLink}</header>
      <main>{children}</main>
      <footer>{footer}</footer>
    </div>
  );
}
