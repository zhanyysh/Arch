import Link from "next/link";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const errorText =
    error === "missing_fields"
      ? "Fill in login and password"
      : error === "invalid_credentials"
        ? "Invalid login/password or access is deactivated"
        : "";

  return (
    <main>
      <section className="auth-shell fade-in">
        <span className="tag">Authorization</span>
        <h1 style={{ marginTop: "0.7rem" }}>Login to Build Control</h1>
        <p style={{ color: "#444" }}>
          Access is created by the administrator. To connect a new company: 0777 77 77 77.
        </p>

        {errorText ? (
          <p style={{ color: "#9b2835", marginTop: "0.8rem", marginBottom: 0 }}>{errorText}</p>
        ) : null}

        <form action="/api/auth/login" method="post">
          <div className="field">
            <label htmlFor="email">Login</label>
            <input id="email" name="email" type="email" placeholder="manager@company.kg" required />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="********" required />
          </div>

          <div className="cta-row">
            <button className="btn btn-primary" type="submit">
              Sign in
            </button>
            <Link className="btn btn-ghost" href="/">
              Home
            </Link>
          </div>
        </form>

        <p style={{ color: "#355777", marginTop: "0.9rem", marginBottom: 0 }}>
          Test admin: admin@build-control.local / Admin123!
        </p>
      </section>
    </main>
  );
}
