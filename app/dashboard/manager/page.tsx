import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import RoleDashboardShell from "@/app/dashboard/RoleDashboardShell";

export default async function ManagerDashboardPage() {
  const session = await requireRole(["manager"]);

  const [projectCount, stageTotal, stageDone] = await Promise.all([
    db.project.count({ where: { companyId: session.companyId } }),
    db.stage.count({
      where: {
        project: {
          companyId: session.companyId
        }
      }
    }),
    db.stage.count({
      where: {
        status: "done",
        project: {
          companyId: session.companyId
        }
      }
    })
  ]);

  const progress = stageTotal === 0 ? 0 : Math.round((stageDone / stageTotal) * 100);

  return (
    <RoleDashboardShell
      roleTitle="Manager Dashboard"
      roleKey="manager"
      subtitle="Project progress, delivery status, and stage completion in one view."
      primaryCta={{ href: "/projects", label: "Open projects" }}
      stats={[
        { label: "Company projects", value: projectCount },
        { label: "Stages completed", value: stageDone },
        { label: "Overall progress", value: `${progress}%` }
      ]}
    />
  );
}
