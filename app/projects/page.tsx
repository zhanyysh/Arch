import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { createProjectAction } from "@/app/projects/actions";
import WorkspaceShell from "@/app/components/WorkspaceShell";
import CreateProjectModal from "@/app/projects/CreateProjectModal";
import ProjectTableRow from "@/app/projects/ProjectTableRow";

interface ProjectListRow {
  id: string;
  title: string;
  description: string;
  status: string;
  foreman: {
    fullName: string;
  };
  stages: Array<{
    status: string;
  }>;
}

interface ForemanOption {
  id: string;
  fullName: string;
}

function formatDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function projectStatusClass(status: string): string {
  if (status === "in_progress") return "status-active";
  if (status === "completed") return "status-completed";
  if (status === "review") return "status-review";
  if (status === "frozen") return "status-frozen";
  return "status-inactive";
}

export default async function ProjectsPage() {
  const session = await requireRole(["manager", "foreman"]);

  const [projects, foremen] = await Promise.all([
    db.project.findMany({
      where: {
        companyId: session.companyId,
        ...(session.role === "foreman" ? { foremanId: session.sub } : {})
      },
      include: {
        foreman: {
          select: {
            fullName: true
          }
        },
        stages: {
          select: {
            status: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    }),
    session.role === "manager"
      ? db.user.findMany({
          where: {
            companyId: session.companyId,
            role: "foreman",
            isActive: true
          },
          select: {
            id: true,
            fullName: true
          },
          orderBy: {
            fullName: "asc"
          }
        })
      : Promise.resolve([])
  ]);

  return (
    <WorkspaceShell
      roleTitle={session.role === "manager" ? "Manager Dashboard" : "Foreman Dashboard"}
      roleSubtitle="Role workspace"
      activeNav="projects"
      dashboardHref={`/dashboard/${session.role}`}
      pageTitle="Projects"
      pageBadge={`${projects.length} total`}
    >
      <p style={{ marginTop: "0.4rem", color: "#58697f" }}>Company projects with status tracking and progress visibility.</p>

      {session.role === "manager" ? (
        <div className="users-toolbar" style={{ marginTop: "1rem" }}>
          <CreateProjectModal
            foremen={foremen as ForemanOption[]}
            action={createProjectAction}
          />
        </div>
      ) : null}

      <div className="users-title-row" style={{ marginTop: "1rem" }}>
        <h2>{session.role === "manager" ? "All company projects" : "My projects"}</h2>
      </div>

      <div className="users-table-wrap" style={{ marginTop: "0.8rem" }}>
        <table className="users-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Foreman</th>
              <th>Status</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {(projects as ProjectListRow[]).map((project) => {
              const stageTotal = project.stages.length;
              const stageDone = project.stages.filter((stage: { status: string }) => stage.status === "done").length;
              const progress = stageTotal === 0 ? 0 : Math.round((stageDone / stageTotal) * 100);

              return (
                <ProjectTableRow key={project.id} projectId={project.id}>
                  <td>
                    <p className="user-name">{project.title}</p>
                    <p className="user-email">{project.description}</p>
                  </td>
                  <td>{project.foreman.fullName}</td>
                  <td>
                    <span className={`status-pill ${projectStatusClass(project.status)}`}>{project.status}</span>
                  </td>
                  <td>
                    <p style={{ margin: 0 }}>
                      {progress}% ({stageDone}/{stageTotal})
                    </p>
                    <div className="progress" style={{ marginTop: "0.35rem" }}>
                      <span style={{ width: `${progress}%` }} />
                    </div>
                  </td>
                </ProjectTableRow>
              );
            })}
          </tbody>
        </table>
      </div>

      {projects.length === 0 ? (
        <article className="panel" style={{ marginTop: "0.8rem" }}>
          <p style={{ margin: 0, color: "#355777" }}>No projects available yet.</p>
        </article>
      ) : null}
    </WorkspaceShell>
  );
}
