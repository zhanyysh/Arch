import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { createStageAction, createTaskAction } from "@/app/projects/[id]/stages/actions";
import BackButton from "@/app/components/BackButton";
import WorkspaceShell from "@/app/components/WorkspaceShell";
import CreateStageModal from "@/app/projects/[id]/stages/CreateStageModal";
import CreateTaskModal from "@/app/projects/[id]/stages/CreateTaskModal";
import StageCard from "@/app/projects/[id]/stages/StageCard";

interface StageTaskRow {
  id: string;
  status: string;
}

interface StageRow {
  id: string;
  order: number;
  title: string;
  startsAt: Date;
  dueAt: Date;
  tasks: StageTaskRow[];
}

function projectStatusLabel(status: string): string {
  if (status === "in_progress") return "In progress";
  if (status === "completed") return "Completed";
  if (status === "review") return "Review";
  if (status === "frozen") return "Frozen";
  return "Planned";
}

function stageStatusTheme(status: string): string {
  if (status === "done") return "status-green";
  if (status === "in_progress") return "status-blue";
  if (status === "review") return "status-yellow";
  if (status === "overdue") return "status-red";
  return "status-gray";
}

function stageStatusLabel(status: string): string {
  if (status === "done") return "Done";
  if (status === "in_progress") return "In progress";
  if (status === "review") return "Review";
  if (status === "overdue") return "Overdue";
  return "Not started";
}

export default async function ProjectStagesPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireRole(["manager", "foreman"]);

  const project = await db.project.findFirst({
    where: {
      id,
      companyId: session.companyId,
      ...(session.role === "foreman" ? { foremanId: session.sub } : {})
    },
    include: {
      foreman: {
        select: { fullName: true }
      },
      stages: {
        include: {
          tasks: { select: { id: true, status: true } }
        },
        orderBy: { order: "asc" }
      }
    }
  });

  const workers = await db.user.findMany({
    where: { companyId: session.companyId, role: "worker", isActive: true },
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" }
  });

  if (!project) notFound();

  const nextOrder = project.stages.length + 1;

  return (
    <WorkspaceShell
      roleTitle={session.role === "manager" ? "Manager Dashboard" : "Foreman Dashboard"}
      roleSubtitle="Role workspace"
      activeNav="projects"
      dashboardHref={`/dashboard/${session.role}`}
      pageTitle=""
    >
      <style>{`
        .saas-content h1 { display: none; }
        
        /* Typography & Structure */
        .panel-container {
          max-width: 1200px;
          margin: 0 auto;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        
        /* Header Area */
        .panel-header {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .breadcrumb {
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          margin-bottom: 1rem;
          font-weight: 500;
        }
        .breadcrumb a {
          color: #3b82f6;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .breadcrumb a:hover {
          color: #1d4ed8;
        }
        .title-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }
        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .page-subtitle {
          font-size: 0.9375rem;
          color: #64748b;
          margin: 0;
        }

        /* Metrics Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .metric-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.02), 0 1px 2px rgba(15, 23, 42, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -1px rgba(15, 23, 42, 0.03);
        }
        .metric-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          margin-bottom: 0.5rem;
        }
        .metric-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: #0f172a;
        }

        /* Toolbar */
        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          margin-bottom: 2rem;
        }
        .toolbar-group {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        .gallery-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #0f172a;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .gallery-link:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        /* Stage List */
        .section-header {
          font-size: 1.25rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 1.5rem;
        }
        .stages-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        /* Stage Card Re-design */
        .stage-card {
          display: flex;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.02);
        }
        .stage-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.05), 0 4px 6px -2px rgba(15, 23, 42, 0.02);
          transform: translateY(-2px);
        }
        .stage-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #e2e8f0;
          transition: background-color 0.2s ease;
        }
        .stage-card:hover::before {
          background: #3b82f6;
        }
        
        .stage-grid {
          display: grid;
          grid-template-columns: auto 1fr auto auto;
          gap: 2rem;
          align-items: center;
          width: 100%;
        }

        .stage-number {
          width: 3rem;
          height: 3rem;
          background: #f1f5f9;
          color: #475569;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.125rem;
          font-weight: 700;
          border: 1px solid #e2e8f0;
        }
        
        .stage-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .stage-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: #0f172a;
          text-decoration: none;
        }
        .stage-meta {
          font-size: 0.8125rem;
          color: #64748b;
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }
        .stage-divider {
          color: #cbd5e1;
        }
        
        .stage-progress-col {
          width: 200px;
        }
        .stage-progress-text {
          font-size: 0.8125rem;
          font-weight: 500;
          color: #475569;
          margin-bottom: 0.5rem;
          display: flex;
          justify-content: space-between;
        }
        .stage-progress-bar {
          height: 6px;
          background: #f1f5f9;
          border-radius: 999px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        .stage-progress-fill {
          height: 100%;
          background: #3b82f6;
          border-radius: 999px;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .stage-progress-fill.fill-done {
          background: #10b981;
        }
        
        .stage-status-wrap {
          width: 120px;
          display: flex;
          justify-content: flex-end;
        }
        
        /* Badges */
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }
        .status-blue { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
        .status-green { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
        .status-gray { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
        .status-red { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .status-yellow { background: #fefce8; color: #ca8a04; border: 1px solid #fef08a; }

        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
          background: #f8fafc;
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          color: #64748b;
        }
      `}</style>

      <div className="panel-container">
        <header className="panel-header">
          <div className="breadcrumb">
            <BackButton label="Projects" fallbackHref="/projects" /> &rsaquo; {project.title}
          </div>
          <div className="title-row">
            <h2 className="page-title">{project.title}</h2>
            <span className={`status-badge status-blue`}>{projectStatusLabel(project.status)}</span>
          </div>
          <p className="page-subtitle">Stage creation, task management, and status control.</p>
        </header>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Foreman / Owner</div>
            <div className="metric-value">{project.foreman.fullName}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Timeline</div>
            <div className="metric-value">
              {project.startsAt.toISOString().slice(0, 10)} <span style={{color:'#94a3b8', margin:'0 4px'}}>&rarr;</span> {project.dueAt.toISOString().slice(0, 10)}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total Stages</div>
            <div className="metric-value">{project.stages.length}</div>
          </div>
        </div>

        <div className="toolbar">
          <div className="toolbar-group">
            <CreateStageModal projectId={project.id} nextOrder={nextOrder} action={createStageAction} />
            <CreateTaskModal
              projectId={project.id}
              stages={(project.stages as StageRow[]).map(s => ({ id: s.id, title: s.title, order: s.order }))}
              workers={workers}
              action={createTaskAction}
            />
          </div>
          <Link className="gallery-link" href={`/projects/${project.id}/gallery`}>
            <svg style={{width:'16px', height:'16px', marginRight:'6px'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Project Gallery
          </Link>
        </div>

        <h3 className="section-header">Execution Timeline</h3>
        
        <div className="stages-list">
          {(project.stages as StageRow[]).map((stage) => {
            const totalTasks = stage.tasks?.length || 0;
            const doneTasks = stage.tasks?.filter((t) => t.status === "done").length || 0;
            const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

            let derivedStatus = "not_started";
            if (totalTasks > 0) {
              if (doneTasks === totalTasks) derivedStatus = "done";
              else if (doneTasks > 0) derivedStatus = "in_progress";
            }

            return (
              <StageCard key={stage.id} projectId={project.id} stageId={stage.id}>
                <div className="stage-grid">
                  <div className="stage-number">{stage.order}</div>
                  
                  <div className="stage-info">
                    <span className="stage-name">{stage.title}</span>
                    <div className="stage-meta">
                      <span>{stage.startsAt.toISOString().slice(0, 10)} to {stage.dueAt.toISOString().slice(0, 10)}</span>
                      <span className="stage-divider">&bull;</span>
                      <span style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>{stage.id}</span>
                    </div>
                  </div>
                  
                  <div className="stage-progress-col">
                    <div className="stage-progress-text">
                      <span>Completion</span>
                      <span style={{ fontWeight: 600 }}>{progress}%</span>
                    </div>
                    <div className="stage-progress-bar">
                      <div className={`stage-progress-fill ${derivedStatus === 'done' ? 'fill-done' : ''}`} style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="stage-status-wrap">
                    <span className={`status-badge ${stageStatusTheme(derivedStatus)}`}>
                      {stageStatusLabel(derivedStatus)}
                    </span>
                  </div>
                </div>
              </StageCard>
            );
          })}

          {project.stages.length === 0 ? (
            <div className="empty-state">
              <svg style={{width:'3rem', height:'3rem', margin:'0 auto 1rem', color:'#94a3b8'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h4 style={{fontSize:'1.125rem', color:'#0f172a', fontWeight:600, margin:'0 0 0.5rem 0'}}>No stages yet</h4>
              <p style={{margin:0}}>Start by creating the first stage for this project.</p>
            </div>
          ) : null}
        </div>
      </div>
    </WorkspaceShell>
  );
}