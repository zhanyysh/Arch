import type { ReactNode } from "react";
import Link from "next/link";

type WorkspaceNav = "dashboard" | "projects";

export default function WorkspaceShell({
  roleTitle,
  roleSubtitle,
  activeNav,
  dashboardHref,
  showProjectsNav = true,
  pageTitle,
  pageBadge,
  children
}: {
  roleTitle: string;
  roleSubtitle: string;
  activeNav: WorkspaceNav;
  dashboardHref: string;
  showProjectsNav?: boolean;
  pageTitle: string;
  pageBadge?: string;
  children: ReactNode;
}) {
  return (
    <div className="saas-shell">
      <aside className="saas-sidebar">
        <div className="saas-brand">
          <div className="saas-brand-logo">AM</div>
          <div>
            <p className="saas-brand-title">Build Control</p>
            <p className="saas-brand-sub">WorkPanel</p>
          </div>
        </div>

        <nav className="saas-nav">
          <Link className={`saas-nav-item ${activeNav === "dashboard" ? "is-active" : ""}`} href={dashboardHref}>
            <span>▦</span>
            <span>Dashboard</span>
          </Link>
          {showProjectsNav ? (
            <Link className={`saas-nav-item ${activeNav === "projects" ? "is-active" : ""}`} href="/projects">
              <span>◍</span>
              <span>Projects</span>
            </Link>
          ) : null}
        </nav>
      </aside>

      <div className="saas-main">
        <header className="saas-header">
          <input className="saas-header-search" placeholder="Search..." disabled />

          <div className="saas-header-right">
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="btn btn-ghost">
                Logout
              </button>
            </form>
            <div className="saas-admin-chip">
              <div className="saas-admin-avatar">RP</div>
              <div>
                <p className="saas-admin-name">{roleTitle}</p>
                <p className="saas-admin-role">{roleSubtitle}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="saas-content">
          <div className="users-title-row">
            <h1>{pageTitle}</h1>
            {pageBadge ? <span className="users-count-badge">{pageBadge}</span> : null}
          </div>
          {children}
        </section>
      </div>
    </div>
  );
}