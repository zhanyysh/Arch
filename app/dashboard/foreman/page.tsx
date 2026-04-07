import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import RoleDashboardShell from "@/app/dashboard/RoleDashboardShell";
import ForemanTaskReview from "./ForemanTaskReview";

export default async function ForemanDashboardPage() {
  const session = await requireRole(["foreman"]);
  const deadline72h = new Date();
  deadline72h.setHours(deadline72h.getHours() + 72);

  const [activeStages, reviewTasks, urgentDeadlines, tasksToReview] = await Promise.all([
    db.stage.count({
      where: {
        status: "in_progress",
        project: {
          foremanId: session.sub,
          companyId: session.companyId
        }
      }
    }),
    db.task.count({
      where: {
        status: "review",
        project: {
          foremanId: session.sub,
          companyId: session.companyId
        }
      }
    }),
    db.stage.count({
      where: {
        dueAt: { lte: deadline72h },
        status: { in: ["not_started", "in_progress", "review"] },
        project: {
          foremanId: session.sub,
          companyId: session.companyId
        }
      }
    }),
    db.task.findMany({
      where: {
        status: "review",
        project: {
          foremanId: session.sub,
          companyId: session.companyId
        }
      },
      include: {
        project: { select: { title: true } },
        stage: { select: { title: true } },
        worker: { select: { fullName: true } },
        photos: true
      },
      orderBy: { updatedAt: 'desc' }
    })
  ]);

  return (
    <RoleDashboardShell
      roleTitle="Foreman Dashboard"
      roleKey="foreman"
      subtitle="Track active stages, review queues, and upcoming deadline risks."
      primaryCta={{ href: "/projects", label: "Open projects" }}
      stats={[
        { label: "Stages in progress", value: activeStages },
        { label: "Tasks in review", value: reviewTasks },
        { label: "Urgent deadlines (72h)", value: urgentDeadlines }
      ]}
    >
      <ForemanTaskReview tasks={tasksToReview} />
    </RoleDashboardShell>
  );
}
