import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import WorkspaceShell from "@/app/components/WorkspaceShell";
import BackButton from "@/app/components/BackButton";

export default async function ProjectGalleryPage({
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
    select: {
      id: true,
      title: true
    }
  });

  if (!project) {
    notFound();
  }

  const photos = await db.photoReport.findMany({
    where: {
      task: {
        projectId: id
      }
    },
    include: {
      task: {
        select: {
          title: true,
          status: true,
          stage: {
            select: {
              title: true,
              order: true
            }
          }
        }
      },
      uploader: {
        select: {
          fullName: true
        }
      }
    },
    orderBy: [
      {
        task: {
          stage: {
            order: "asc"
          }
        }
      },
      { uploadedAt: "desc" }
    ]
  });

  // Group by stage title
  const grouped = photos.reduce((acc, photo) => {
    const stageName = photo.task.stage.title || "Unknown Stage";
    if (!acc[stageName]) {
      acc[stageName] = [];
    }
    acc[stageName].push(photo);
    return acc;
  }, {} as Record<string, typeof photos>);

  return (
    <WorkspaceShell
      roleTitle={session.role === "manager" ? "Manager Dashboard" : "Foreman Dashboard"}
      roleSubtitle="Role workspace"
      activeNav="projects"
      dashboardHref={`/dashboard/${session.role}`}
      pageTitle={`${project.title} - Gallery`}
      pageBadge={`${photos.length} photos`}
    >
      <p style={{ marginTop: "0.4rem", color: "#58697f" }}>All project photos broken down by stages.</p>

      <div className="users-toolbar" style={{ marginTop: "0.8rem" }}>
        <BackButton label="Back to stages" fallbackHref={`/projects/${project.id}/stages`} />
      </div>

      {Object.keys(grouped).length === 0 ? (
        <article className="panel" style={{ marginTop: "0.8rem" }}>
          <p style={{ margin: 0, color: "#355777" }}>No photos have been uploaded for this project yet.</p>
        </article>
      ) : (
        Object.entries(grouped).map(([stageName, stagePhotos]) => (
          <div key={stageName} style={{ marginTop: "1.5rem" }}>
            <h3 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>{stageName}</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1rem" }}>
              {stagePhotos.map((photo) => (
                <div key={photo.id} className="panel" style={{ width: "320px", padding: "0.8rem" }}>
                  <p style={{ margin: "0 0 0.5rem 0", fontWeight: 600, fontSize: "0.9rem" }}>{photo.task.title}</p>
                  <p style={{ margin: "0 0 0.8rem 0", fontSize: "0.8rem", color: "#58697f" }}>
                    Uploaded by {photo.uploader.fullName} on {photo.uploadedAt.toISOString().slice(0, 10)}
                  </p>
                  <a href={photo.url} target="_blank" rel="noreferrer" style={{ display: "block" }}>
                    <img
                      src={photo.url}
                      alt={photo.task.title}
                      style={{
                        width: "100%",
                        height: "250px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        cursor: "zoom-in"
                      }}
                    />
                  </a>
                  <div style={{ marginTop: "0.8rem", display: "flex", justifyContent: "space-between" }}>
                    <span className="status-pill status-inactive" style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}>
                      {photo.kind === "before" ? "Before" : "After"}
                    </span>
                    <span className="status-pill status-active" style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}>
                      Attempt {photo.attempt}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </WorkspaceShell>
  );
}