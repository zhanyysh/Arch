import Link from "next/link";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const errorText =
    error === "missing_fields"
      ? "Заполните логин и пароль"
      : error === "invalid_credentials"
        ? "Неверный логин/пароль или доступ деактивирован"
        : "";

  return (
    <main>
      <section className="auth-shell fade-in">
        <span className="tag">Авторизация</span>
        <h1 style={{ marginTop: "0.7rem" }}>Вход в Build Control</h1>
        <p style={{ color: "#444" }}>
          Доступ создаётся администратором. Для подключения новой компании: 0777 77 77 77.
        </p>

        {errorText ? (
          <p style={{ color: "#9b2835", marginTop: "0.8rem", marginBottom: 0 }}>{errorText}</p>
        ) : null}

        <form action="/api/auth/login" method="post">
          <div className="field">
            <label htmlFor="email">Логин</label>
            <input id="email" name="email" type="email" placeholder="manager@company.kg" required />
          </div>

          <div className="field">
            <label htmlFor="password">Пароль</label>
            <input id="password" name="password" type="password" placeholder="********" required />
          </div>

          <div className="cta-row">
            <button className="btn btn-primary" type="submit">
              Войти
            </button>
            <Link className="btn btn-ghost" href="/">
              На главную
            </Link>
          </div>
        </form>

        <p style={{ color: "#355777", marginTop: "0.9rem", marginBottom: 0 }}>
          Тестовый админ: admin@build-control.local / Admin123!
        </p>
      </section>
    </main>
  );
}
