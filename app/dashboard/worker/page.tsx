import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import WorkspaceShell from "@/app/components/WorkspaceShell";
import UpdateTaskModal from "./UpdateTaskModal";
import ViewTaskPhotosModal from "@/app/components/ViewTaskPhotosModal";
import { updateWorkerTaskAction } from "./actions";

export default async function WorkerDashboardPage() {
  const session = await requireRole(["worker"]);

  const [todayTasks, doneTasks, requiredAfterPhoto] = await Promise.all([
    db.task.count({ where: { workerId: session.sub } }),
    db.task.count({ where: { workerId: session.sub, status: "done" } }),
    db.task.count({ where: { workerId: session.sub, requiresAfterPhoto: true, status: { not: "done" } } })
  ]);

  const rawTasks = await db.task.findMany({
    where: { workerId: session.sub },
    include: {
      project: { select: { title: true } },
      stage: { select: { title: true, dueAt: true } },
      photos: true
    },
    orderBy: [
      { status: "asc" },
      { stage: { dueAt: "asc" } }
    ]
  });

  const getStatusClass = (status: string) => {
    if (status === "done") return "status-completed";
    if (status === "in_progress") return "status-active";
    if (status === "review" || status === "rework") return "status-review";
    return "status-inactive";
  };

  return (
    <WorkspaceShell
      roleTitle="Worker Dashboard"
      roleSubtitle="Role workspace"
      activeNav="dashboard"
      dashboardHref="/dashboard/worker"
      pageTitle="My Assignments"
      pageBadge={`${rawTasks.length} tasks`}
      showProjectsNav={false}
    >
      <p style={{ marginTop: "0.4rem", color: "#58697f" }}>
        Your assigned workload, completion pace, and pending tasks.
      </p>

      <div className="dashboard-cards" style={{ marginTop: "1rem" }}>
        <article className="dashboard-card card-blue">
          <p>Total Tasks</p>
          <strong>{todayTasks}</strong>
        </article>
        <article className="dashboard-card card-gray">
          <p>Completed</p>
          <strong>{doneTasks}</strong>
        </article>
        <article className="dashboard-card card-orange">
          <p>Awaiting Photos</p>
          <strong>{requiredAfterPhoto}</strong>
        </article>
      </div>

      <div className="users-title-row" style={{ marginTop: "2rem" }}>
        <h2>My Tasks</h2>
      </div>

      <div className="users-table-wrap" style={{ marginTop: "1rem" }}>
        <table className="users-table">
          <thead>
            <tr>
              <th>Task Title</th>
              <th>Context</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Photo Req.</th>
              <th>Photos</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rawTasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <p className="user-name">{task.title}</p>
                </td>
                <td>
                  <p className="user-name">{task.project.title}</p>
                  <p className="user-email">{task.stage.title}</p>
                </td>
                <td>
                  <span className={`status-pill ${getStatusClass(task.status)}`}>
                    {task.status.replace("_", " ")}
                  </span>
                </td>
                <td>{task.stage.dueAt.toISOString().slice(0, 10)}</td>
                <td>
                  {task.requiresAfterPhoto ? (
                    <span style={{color: "var(--color-primary)", fontWeight: "500"}}>Yes</span>
                  ) : "No"}
                </td>
                <td>
                  <ViewTaskPhotosModal photos={task.photos} title={task.title} />
                </td>
                <td>
                  <div className="cta-row" style={{ marginTop: 0 }}>
                    <UpdateTaskModal 
                      task={{
                        id: task.id,
                        title: task.title,
                        status: task.status,
                        requiresAfterPhoto: task.requiresAfterPhoto,
                        stageTitle: task.stage.title,
                        projectTitle: task.project.title
                      }}
                      action={updateWorkerTaskAction}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {rawTasks.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                  <p className="user-email">You have no tasks assigned yet.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </WorkspaceShell>
  );
}
