import Link from "next/link";
import WorkspaceShell from "@/app/components/WorkspaceShell";

interface RoleDashboardStat {
  label: string;
  value: string | number;
}

export default function RoleDashboardShell({
  roleTitle,
  roleKey,
  subtitle,
  primaryCta,
  stats,
  children
}: {
  roleTitle: string;
  roleKey: "manager" | "foreman" | "worker";
  subtitle: string;
  primaryCta?: {
    href: string;
    label: string;
  };
  stats: RoleDashboardStat[];
  children?: React.ReactNode;
}) {
  return (
    <WorkspaceShell
      roleTitle={roleTitle}
      roleSubtitle="Role dashboard"
      activeNav="dashboard"
      dashboardHref={`/dashboard/${roleKey}`}
      showProjectsNav={roleKey !== "worker"}
      pageTitle={roleTitle}
      pageBadge="Live overview"
    >
      <p style={{ marginTop: "0.4rem", color: "#58697f" }}>{subtitle}</p>

      {primaryCta ? (
        <div className="cta-row" style={{ marginTop: "0.9rem" }}>
          <Link className="btn btn-primary" href={primaryCta.href}>
            {primaryCta.label}
          </Link>
        </div>
      ) : null}

      <div className="dashboard-cards" style={{ marginTop: "1rem" }}>
        {stats.map((stat, index) => (
          <article
            key={stat.label}
            className={`dashboard-card ${index % 3 === 0 ? "card-blue" : index % 3 === 1 ? "card-gray" : "card-orange"}`}
          >
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </div>

      {children}
    </WorkspaceShell>
  );
}