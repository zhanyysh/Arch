import Link from "next/link";

export default function LandingPage() {
  return (
    <main>
      <section className="hero-grid">
        <div className="fade-in">
          <span className="tag">ArchManager v1</span>
          <h1>Управляйте стройкой как единой системой, а не чатом задач</h1>
          <p className="lead">
            Централизованная платформа для компаний: проекты, этапы, роли, фотоотчёты До/После
            и контроль дедлайнов в одном рабочем пространстве.
          </p>
          <div className="cta-row">
            <a className="btn btn-accent" href="tel:+996777777777">
              Позвонить: 0777 77 77 77
            </a>
            <Link className="btn btn-primary" href="/login">
              Войти в систему
            </Link>
            <a className="btn btn-ghost" href="#capabilities">
              Смотреть возможности
            </a>
          </div>
          <p className="lead" style={{ fontSize: "0.95rem" }}>
            Для начала работы позвоните нам по номеру 0777 77 77 77 - мы создадим аккаунт
            для вашей компании.
          </p>
        </div>

        <aside className="panel fade-in stagger-1">
          <h2 style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>Что видно в реальном времени</h2>
          <div className="metrics">
            <div className="metric">
              <strong>12</strong>
              активных объектов
            </div>
            <div className="metric">
              <strong>286</strong>
              задач под контролем
            </div>
            <div className="metric">
              <strong>94%</strong>
              задач с фото-подтверждением
            </div>
            <div className="metric">
              <strong>24/7</strong>
              доступ к прогрессу
            </div>
          </div>
        </aside>
      </section>

      <section className="section" id="capabilities">
        <h2 style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>Ключевые возможности</h2>
        <div className="features">
          <article className="feature fade-in stagger-1">
            <h3>Проекты и этапы</h3>
            <p>
              Менеджер формирует проект, назначает прораба, отслеживает статусы и общий прогресс по
              этапам.
            </p>
          </article>
          <article className="feature fade-in stagger-2">
            <h3>Роли и доступ</h3>
            <p>
              Администратор создаёт аккаунты, а каждый пользователь видит только свой функциональный
              контур.
            </p>
          </article>
          <article className="feature fade-in">
            <h3>Фото До/После</h3>
            <p>
              Работник не может завершить задачу без фото результата. Прораб проверяет в режиме
              сравнения side-by-side.
            </p>
          </article>
        </div>
      </section>

      <section className="section" id="testimonials" style={{ marginTop: "4rem", backgroundColor: "#f9fbfd", padding: "3rem", borderRadius: "12px" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "2rem", textAlign: "center" }}>Почему выбирают ArchManager</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", paddingBottom: "1rem" }}>
          <article className="card-panel" style={{ backgroundColor: "#fff" }}>
            <p style={{ fontStyle: "italic", marginBottom: "1rem", color: "#344558" }}>
              «Раньше мы теряли сотни фотографий в мессенджерах. Теперь каждый этап стройки подкреплен фотоотчетом "До" и "После", привязанным к конкретной задаче. Контроль стал прозрачным.»
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e2e8f0" }}></div>
              <div>
                <strong>Азамат К.</strong>
                <div style={{ fontSize: "0.85rem", color: "#58697f" }}>Главный инженер, СтройГрупп</div>
              </div>
            </div>
          </article>
          <article className="card-panel" style={{ backgroundColor: "#fff" }}>
            <p style={{ fontStyle: "italic", marginBottom: "1rem", color: "#344558" }}>
              «Разделение ролей — лучшее решение. Рабочие видят только свои задачи и не путаются в документации, а я получаю сводку по всем объектам на одном дашборде.»
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e2e8f0" }}></div>
              <div>
                <strong>Елена С.</strong>
                <div style={{ fontSize: "0.85rem", color: "#58697f" }}>Руководитель проектов</div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
