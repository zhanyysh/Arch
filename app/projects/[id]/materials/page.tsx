import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import BackButton from "@/app/components/BackButton";
import WorkspaceShell from "@/app/components/WorkspaceShell";
import CreateMaterialModal from "./CreateMaterialModal";
import ConsumeMaterialModal from "./ConsumeMaterialModal";
import { createMaterialAction, updateMaterialStatusAction, deleteMaterialAction, consumeMaterialAction } from "./actions";

const MATERIAL_STATUSES = ["planned", "ordered", "delivered", "used"] as const;

function statusOptions(currentStatus: string): string[] {
  return [...MATERIAL_STATUSES];
}

function statusTheme(status: string): string {
  if (status === "ordered") return "status-yellow";
  if (status === "delivered") return "status-blue";
  if (status === "used") return "status-gray";
  return "status-gray"; // planned
}

function formatCurrency(amount: number | null): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export default async function MaterialsPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { id } = await params;
  const filters = await searchParams;
  const session = await requireRole(["manager", "foreman"]);

  const query = (filters.q ?? "").trim();
  const statusFilter = filters.status;

  const project = await db.project.findFirst({
    where: {
      id,
      companyId: session.companyId,
      ...(session.role === "foreman" ? { foremanId: session.sub } : {})
    },
    include: {
      materials: {
        where: {
          ...(query.length > 0 ? { name: { contains: query, mode: "insensitive" } } : {}),
          ...(statusFilter ? { status: statusFilter as any } : {})
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  if (!project) notFound();

  const totalCost = project.materials.reduce((sum, item) => sum + (item.cost || 0), 0);

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
        
        .panel-container { max-width: 1200px; margin: 0 auto; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
        .panel-header { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; }
        .breadcrumb { font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 1rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; }
        .breadcrumb a { color: #3b82f6; text-decoration: none; transition: color 0.15s ease; }
        .breadcrumb a:hover { color: #1d4ed8; }
        .title-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
        .page-title { font-size: 2rem; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
        .page-subtitle { font-size: 0.9375rem; color: #64748b; margin: 0; }

        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2.5rem; }
        .metric-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.02); }
        .metric-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 0.5rem; }
        .metric-value { font-size: 1.125rem; font-weight: 600; color: #0f172a; }

        .toolbar { display: flex; flex-direction: row; flex-wrap: nowrap; justify-content: space-between; align-items: center; gap: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0.75rem 1rem; margin-bottom: 2rem; overflow-x: auto; }
        .filter-group { display: flex; gap: 0.75rem; align-items: center; flex-direction: row; flex-wrap: nowrap; margin: 0; }
        .search-input, .filter-select { padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; color: #0f172a; outline: none; }
        .btn-apply { background: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer; }

        .section-header { font-size: 1.25rem; font-weight: 600; color: #0f172a; margin-bottom: 1.5rem; }
        
        .material-card { display: flex; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; position: relative; overflow: hidden; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.02); margin-bottom: 1rem; }
        .material-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #e2e8f0; transition: background-color 0.2s ease; }
        .material-card:hover::before { background: #3b82f6; }
        
        .material-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 1.5rem; align-items: center; width: 100%; }

        .material-info { display: flex; flex-direction: column; gap: 0.25rem; }
        .material-name { font-size: 1.125rem; font-weight: 600; color: #0f172a; }
        .material-supplier { font-size: 0.8125rem; color: #64748b; }
        
        .qty-val { font-weight: 600; color: #0f172a; font-size: 1.125rem; }
        .qty-unit { color: #64748b; font-size: 0.875rem; margin-left: 0.25rem; }
        
        .inline-status-form { display: flex; align-items: center; gap: 0.5rem; margin: 0; }
        .inline-status-form select { flex: 1; min-width: 130px; }

        .empty-state { padding: 4rem 2rem; text-align: center; background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; color: #64748b; }
      `}</style>
      
      <div className="panel-container">
        <header className="panel-header">
          <div className="breadcrumb">
            <BackButton label="Stages" fallbackHref={`/projects/${project.id}/stages`} />
            <span>&rsaquo;</span>
            <span>{project.title}</span>
          </div>
          <div className="title-row">
            <h2 className="page-title">Project Materials</h2>
          </div>
          <p className="page-subtitle">Track required materials, quantities, costs, and delivery statuses.</p>
        </header>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Total Unique Items</div>
            <div className="metric-value">{project.materials.length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Estimated/Total Cost</div>
            <div className="metric-value" style={{ color: "#059669" }}>{formatCurrency(totalCost)}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Items Delivered</div>
            <div className="metric-value">{project.materials.filter(m => m.status === 'delivered').length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Items Pending</div>
            <div className="metric-value">{project.materials.filter(m => ['planned', 'ordered'].includes(m.status)).length}</div>
          </div>
        </div>

        <div className="toolbar">
          <form className="filter-group" method="get">
            <input key={query} className="search-input" name="q" defaultValue={query} placeholder="Search material name..." />
            <select key={statusFilter || "all"} className="filter-select" name="status" defaultValue={statusFilter || ""}>
              <option value="">Any Status</option>
              {MATERIAL_STATUSES.map((status) => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
            <button className="btn-apply" type="submit">Filter</button>
          </form>

          <CreateMaterialModal projectId={project.id} action={createMaterialAction} />
        </div>

        <h3 className="section-header">Materials Ledger</h3>
        
        <div className="materials-list">
          {project.materials.map((material) => (
            <div key={material.id} className="material-card">
              <div className="material-grid">
                
                <div className="material-info">
                  <span className="material-name">{material.name}</span>
                  {material.supplier && (
                    <span className="material-supplier">Supplier: {material.supplier}</span>
                  )}
                  {material.cost ? (
                    <span className="material-supplier" style={{ marginTop: '0.2rem', color: '#166534', fontWeight: 500 }}>
                      {formatCurrency(material.cost)}
                    </span>
                  ) : null}
                </div>
                
                <div className="material-qty">
                  <span className="qty-val">{material.quantity}</span>
                  <span className="qty-unit">{material.unit}</span>
                </div>
                
                <div className="material-status-controls">
                  <form action={updateMaterialStatusAction} className="inline-status-form">
                    <input type="hidden" name="materialId" value={material.id} />
                    <input type="hidden" name="projectId" value={project.id} />
                    <select key={material.status} className="filter-select" name="status" defaultValue={material.status}>
                      {statusOptions(material.status).map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn btn-ghost" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>Update</button>
                  </form>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center' }}>
                   {material.quantity > 0 && material.status !== 'planned' && (
                     <ConsumeMaterialModal
                        projectId={project.id}
                        materialId={material.id}
                        name={material.name}
                        maxQuantity={material.quantity}
                        unit={material.unit}
                        action={consumeMaterialAction}
                     />
                   )}
                   <form action={deleteMaterialAction}>
                     <input type="hidden" name="materialId" value={material.id} />
                     <input type="hidden" name="projectId" value={project.id} />
                     <button type="submit" className="btn btn-ghost" style={{ color: "#dc2626", fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}>
                       Delete
                     </button>
                   </form>
                </div>
                
              </div>
            </div>
          ))}

          {project.materials.length === 0 ? (
            <div className="empty-state">
              <h4 style={{fontSize:'1.125rem', color:'#0f172a', fontWeight:600, margin:'0 0 0.5rem 0'}}>No materials listed</h4>
              <p style={{margin:0}}>Add your first material to start tracking project inventory.</p>
            </div>
          ) : null}
        </div>
      </div>
    </WorkspaceShell>
  );
}