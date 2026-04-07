import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import BackButton from "@/app/components/BackButton";
import WorkspaceShell from "@/app/components/WorkspaceShell";
import CreateTaskModal from "@/app/projects/[id]/stages/CreateTaskModal";
import { createTaskAction } from "@/app/projects/[id]/stages/actions";
import { updateTaskStatusAction } from "@/app/projects/[id]/stages/[stageId]/actions";
import ViewTaskPhotosModal from "@/app/components/ViewTaskPhotosModal";

const TASK_STATUSES = ["All", "new", "in_progress", "review", "done", "rework"] as const;

type TaskStatusFilter = (typeof TASK_STATUSES)[number];

interface StageTaskPageRow {
  id: string;
  title: string;
  status: string;
  requiresAfterPhoto: boolean;
  worker: {
    fullName: string;
    email: string;
  };
  photos: any[];
}

function taskStatusClass(status: string): string {
  if (status === "done") return "status-completed";
  if (status === "in_progress") return "status-active";
  if (status === "review") return "status-review";
  if (status === "rework") return "status-suspended";
  return "status-inactive";
}

export default async function StageTasksPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string; stageId: string }>;
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { id: projectId, stageId } = await params;
  const filters = await searchParams;
  const session = await requireRole(["manager", "foreman"]);

  const query = (filters.q ?? "").trim();
  const statusFilter = (filters.status ?? "All") as TaskStatusFilter;
  const effectiveStatus = TASK_STATUSES.includes(statusFilter) ? statusFilter : "All";

  const project = await db.project.findFirst({
    where: {
      id: projectId,
      companyId: session.companyId,
      ...(session.role === "foreman" ? { foremanId: session.sub } : {})
    },
    select: {
      id: true,
      title: true,
      stages: {
        where: { id: stageId },
        select: {
          id: true,
          title: true,
          order: true,
          tasks: {
            where: {
              ...(query.length > 0 ? { title: { contains: query, mode: "insensitive" } } : {}),
              ...(effectiveStatus !== "All" ? { status: effectiveStatus } : {})
            },
            include: {
              worker: {
                select: {
                  fullName: true,
                  email: true
                }
              },
              photos: true
            },
            orderBy: {
              createdAt: "desc"
            }
          }
        }
      }
    }
  });

  if (!project || project.stages.length === 0) {
    notFound();
  }

  const stage = project.stages[0];

  const workers = await db.user.findMany({
    where: {
      companyId: session.companyId,
      role: "worker",
      isActive: true
    },
    select: {
      id: true,
      fullName: true
    },
    orderBy: {
      fullName: "asc"
    }
  });

  return (
    <WorkspaceShell
      roleTitle={session.role === "manager" ? "Manager Dashboard" : "Foreman Dashboard"}
      roleSubtitle="Role workspace"
      activeNav="projects"
      dashboardHref={`/dashboard/${session.role}`}
      pageTitle={`Stage #${stage.order}: ${stage.title}`}
      pageBadge={`${stage.tasks.length} tasks`}
    >
      <p style={{ marginTop: "0.4rem", color: "#58697f" }}>
        Task list for the selected stage with assignee and status controls.
      </p>

      <div className="users-toolbar" style={{ marginTop: "0.8rem" }}>
        <BackButton label="Back to stages" fallbackHref={`/projects/${project.id}/stages`} />
      </div>

      <div className="users-toolbar" style={{ marginTop: "0.8rem" }}>
        <form className="users-toolbar" method="get" style={{ marginTop: 0 }}>
          <input
            className="users-filter-input"
            name="q"
            defaultValue={query}
            placeholder="Search task title"
          />
          <select name="status" defaultValue={effectiveStatus}>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === "All" ? "Status: All" : status}
              </option>
            ))}
          </select>
          <button className="btn btn-ghost" type="submit">
            Apply
          </button>
        </form>

        <CreateTaskModal
          projectId={project.id}
          stages={[{ id: stage.id, title: stage.title, order: stage.order }]}
          workers={workers}
          action={createTaskAction}
        />
      </div>

      <div className="users-table-wrap" style={{ marginTop: "0.8rem" }}>
        <table className="users-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Worker</th>
              <th>Status</th>
              <th>Photo policy</th>
              <th>Photos</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(stage.tasks as StageTaskPageRow[]).map((task: StageTaskPageRow) => (
              <tr key={task.id}>
                <td>
                  <p className="user-name">{task.title}</p>
                  <p className="user-email">{task.id}</p>
                </td>
                <td>
                  <p className="user-name">{task.worker.fullName}</p>
                  <p className="user-email">{task.worker.email}</p>
                </td>
                <td>
                  <span className={`status-pill ${taskStatusClass(task.status)}`}>{task.status}</span>
                </td>
                <td>{task.requiresAfterPhoto ? "After-photo required" : "No photo required"}</td>
                <td>
                  <ViewTaskPhotosModal photos={task.photos} title={task.title} />
                </td>
                <td>
                  <form action={updateTaskStatusAction} className="users-toolbar" style={{ margin: 0 }}>
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="stageId" value={stage.id} />
                    <input type="hidden" name="taskId" value={task.id} />
                    <select name="status" defaultValue={task.status}>
                      {TASK_STATUSES.filter((status) => status !== "All").map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button className="btn btn-ghost" type="submit">
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stage.tasks.length === 0 ? (
        <article className="panel" style={{ marginTop: "0.8rem" }}>
          <p style={{ margin: 0, color: "#355777" }}>No tasks found for this stage.</p>
        </article>
      ) : null}
    </WorkspaceShell>
  );
}
