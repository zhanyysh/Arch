import Link from "next/link";

export default function LandingPage() {
  return (
    <main>
      <section className="hero-grid">
        <div className="fade-in">
          <span className="tag">Build Control v1</span>
          <h1>Manage construction as a unified system, not a task chat</h1>
          <p className="lead">
            Centralized platform for companies: projects, stages, roles, before/after photo reports
            and deadline control in one workspace.
          </p>
          <div className="cta-row">
            <a className="btn btn-accent" href="tel:+996777777777">
              Call: 0777 77 77 77
            </a>
            <Link className="btn btn-primary" href="/login">
              Log in
            </Link>
            <a className="btn btn-ghost" href="#capabilities">
              View features
            </a>
          </div>
          <p className="lead" style={{ fontSize: "0.95rem" }}>
            To get started, call us at 0777 77 77 77 - we'll create an account
            for your company.
          </p>
        </div>

        <aside className="panel fade-in stagger-1">
          <h2 style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>Real-time overview</h2>
          <div className="metrics">
            <div className="metric">
              <strong>12</strong>
              active projects
            </div>
            <div className="metric">
              <strong>286</strong>
              tasks under control
            </div>
            <div className="metric">
              <strong>94%</strong>
              tasks with photo confirmation
            </div>
            <div className="metric">
              <strong>24/7</strong>
              access to progress
            </div>
          </div>
        </aside>
      </section>

      <section className="section" id="capabilities">
        <h2 style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>Key features</h2>
        <div className="features">
          <article className="feature fade-in stagger-1">
            <h3>Projects and stages</h3>
            <p>
              Manager creates a project, assigns a foreman, tracks status and overall progress across stages.
            </p>
          </article>
          <article className="feature fade-in stagger-2">
            <h3>Roles and access</h3>
            <p>
              Admin creates accounts, and each user sees only their functional scope.
            </p>
          </article>
          <article className="feature fade-in">
            <h3>Before/After photos</h3>
            <p>
              Worker cannot complete a task without a result photo. Foreman reviews in side-by-side comparison mode.
            </p>
          </article>
        </div>
      </section>

      <section className="section" id="testimonials" style={{ marginTop: "4rem", backgroundColor: "#f9fbfd", padding: "3rem", borderRadius: "12px" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "2rem", textAlign: "center" }}>Why choose Build Control</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", paddingBottom: "1rem" }}>
          <article className="card-panel" style={{ backgroundColor: "#fff" }}>
            <p style={{ fontStyle: "italic", marginBottom: "1rem", color: "#344558" }}>
              «Before, we were losing hundreds of photos in messengers. Now each construction stage is supported by before and after photo reports tied to specific tasks. Control became transparent.»
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e2e8f0" }}></div>
              <div>
                <strong>Azamat K.</strong>
                <div style={{ fontSize: "0.85rem", color: "#58697f" }}>Chief Engineer, BuildGroup</div>
              </div>
            </div>
          </article>
          <article className="card-panel" style={{ backgroundColor: "#fff" }}>
            <p style={{ fontStyle: "italic", marginBottom: "1rem", color: "#344558" }}>
              «Role separation is the best solution. Workers see only their tasks and don't get confused by documentation, and I get a summary of all projects on one dashboard.»
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e2e8f0" }}></div>
              <div>
                <strong>Elena S.</strong>
                <div style={{ fontSize: "0.85rem", color: "#58697f" }}>Project Manager</div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
