"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type NavItem = "dashboard" | "users" | "companies" | "billing" | "settings" | "logs";

type UserStatus = "Active" | "Inactive" | "Suspended";
type UserPlan = "Free" | "Pro" | "Enterprise";
type InviteRole = "admin" | "manager" | "foreman" | "worker";
type DrawerTab = "overview" | "activity" | "billing";
type CompanyStatus = "Active" | "Inactive";

interface UserActivityItem {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
}

interface UserBillingInfo {
  plan: UserPlan;
  monthlyAmount: number;
  currency: string;
  renewalDate: string;
  paymentStatus: string;
}

interface DrawerDetailsResponse {
  overview: {
    id: string;
    fullName: string;
    email: string;
    role: InviteRole;
    companyName: string;
    status: UserStatus;
    joinedAt: string;
    lastLogin: string;
    totalSessions: number;
  };
  activity: UserActivityItem[];
  billing: UserBillingInfo;
}

export interface AdminUserRow {
  id: string;
  fullName: string;
  email: string;
  role: InviteRole;
  companyId: string;
  companyName: string;
  joinedAt: string;
  lastActiveAt: string;
  status: UserStatus;
  plan: UserPlan;
}

export interface AdminCompanyOption {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function formatDate(dateIso: string): string {
  const date = new Date(dateIso);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function initialsFromName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "U";
  const second = parts[1]?.[0] ?? "S";
  return `${first}${second}`.toUpperCase();
}

export default function AdminPanelClient({
  users,
  companies,
  currentUserName,
  currentUserRole
}: {
  users: AdminUserRow[];
  companies: AdminCompanyOption[];
  currentUserName: string;
  currentUserRole: string;
}) {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState<NavItem>("users");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "All">("All");
  const [planFilter, setPlanFilter] = useState<UserPlan | "All">("All");
  const [dateFilter, setDateFilter] = useState<"All" | "Last30" | "Last180">("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [companyCreateOpen, setCompanyCreateOpen] = useState(false);
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [isSubmittingCompany, setIsSubmittingCompany] = useState(false);
  const [isMutatingUsers, setIsMutatingUsers] = useState(false);
  const [isMutatingCompanies, setIsMutatingCompanies] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCompanyEditMode, setIsCompanyEditMode] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<DrawerTab>("overview");
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerDetails, setDrawerDetails] = useState<DrawerDetailsResponse | null>(null);
  const [inviteForm, setInviteForm] = useState({
    fullName: "",
    email: "",
    role: "manager" as InviteRole,
    companyId: companies.find((company) => company.isActive)?.id ?? companies[0]?.id ?? "",
    password: ""
  });
  const [companyQuery, setCompanyQuery] = useState("");
  const [companyStatusFilter, setCompanyStatusFilter] = useState<CompanyStatus | "All">("All");
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [companyForm, setCompanyForm] = useState({
    name: "",
    phone: ""
  });
  const [companyEditForm, setCompanyEditForm] = useState({
    status: "Active" as CompanyStatus
  });

  const dashboardStats = useMemo(() => {
    const activeUsers = users.filter((user) => user.status === "Active").length;
    const suspendedUsers = users.filter((user) => user.status === "Suspended").length;
    const enterpriseUsers = users.filter((user) => user.plan === "Enterprise").length;

    return {
      usersTotal: users.length,
      activeUsers,
      suspendedUsers,
      companiesTotal: companies.length,
      enterpriseUsers
    };
  }, [users, companies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const queryMatch =
        companyQuery.trim().length === 0 ||
        company.name.toLowerCase().includes(companyQuery.toLowerCase()) ||
        company.phone.toLowerCase().includes(companyQuery.toLowerCase());

      const companyStatus: CompanyStatus = company.isActive ? "Active" : "Inactive";
      const statusMatch = companyStatusFilter === "All" || companyStatus === companyStatusFilter;

      return queryMatch && statusMatch;
    });
  }, [companies, companyQuery, companyStatusFilter]);

  const selectedCompany = useMemo(
    () => filteredCompanies.find((company) => company.id === selectedCompanyId) ?? null,
    [filteredCompanies, selectedCompanyId]
  );

  const allVisibleCompaniesSelected =
    filteredCompanies.length > 0 &&
    filteredCompanies.every((company) => selectedCompanyIds.includes(company.id));

  const toggleSelectAllCompanies = () => {
    if (allVisibleCompaniesSelected) {
      setSelectedCompanyIds((prev) =>
        prev.filter((id) => !filteredCompanies.some((company) => company.id === id))
      );
      return;
    }

    setSelectedCompanyIds((prev) => {
      const merged = new Set(prev);
      filteredCompanies.forEach((company) => merged.add(company.id));
      return Array.from(merged);
    });
  };

  const toggleSelectCompany = (companyId: string) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(companyId) ? prev.filter((id) => id !== companyId) : [...prev, companyId]
    );
  };

  const [editForm, setEditForm] = useState({
    fullName: "",
    role: "manager" as InviteRole,
    companyId: companies.find((company) => company.isActive)?.id ?? companies[0]?.id ?? "",
    status: "Active" as UserStatus
  });

  const filteredUsers = useMemo(() => {
    const now = new Date();

    return users.filter((user) => {
      const queryMatch =
        query.trim().length === 0 ||
        user.fullName.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase());

      const statusMatch = statusFilter === "All" || user.status === statusFilter;
      const planMatch = planFilter === "All" || user.plan === planFilter;

      let dateMatch = true;
      if (dateFilter !== "All") {
        const joinedDate = new Date(user.joinedAt);
        const dayDiff = (now.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24);
        dateMatch = dateFilter === "Last30" ? dayDiff <= 30 : dayDiff <= 180;
      }

      return queryMatch && statusMatch && planMatch && dateMatch;
    });
  }, [users, query, statusFilter, planFilter, dateFilter]);

  const selectedUser = useMemo(
    () => filteredUsers.find((user) => user.id === selectedUserId) ?? null,
    [filteredUsers, selectedUserId]
  );

  const allVisibleSelected =
    filteredUsers.length > 0 && filteredUsers.every((user) => selectedIds.includes(user.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredUsers.some((user) => user.id === id)));
      return;
    }

    setSelectedIds((prev) => {
      const merged = new Set(prev);
      filteredUsers.forEach((user) => merged.add(user.id));
      return Array.from(merged);
    });
  };

  const toggleSelectOne = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const navItems: { key: NavItem; label: string; icon: string }[] = [
    { key: "dashboard", label: "Dashboard", icon: "▦" },
    { key: "users", label: "Users", icon: "◉" },
    { key: "companies", label: "Companies", icon: "▣" }
  ];

  useEffect(() => {
    if (!selectedUser) {
      setIsEditMode(false);
      setActiveDrawerTab("overview");
      setDrawerDetails(null);
      return;
    }

    setEditForm({
      fullName: selectedUser.fullName,
      role: selectedUser.role,
      companyId: selectedUser.companyId,
      status: selectedUser.status
    });
    setIsEditMode(false);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedUserId(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedCompany) {
      setIsCompanyEditMode(false);
      return;
    }

    setCompanyEditForm({
      status: selectedCompany.isActive ? "Active" : "Inactive"
    });
    setIsCompanyEditMode(false);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedCompanyId(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedCompany]);

  useEffect(() => {
    if (!selectedUserId) {
      return;
    }

    let cancelled = false;

    const loadDetails = async () => {
      setDrawerLoading(true);
      try {
        const response = await fetch(`/api/admin/users/${selectedUserId}`);

        if (!response.ok) {
          throw new Error("Failed to load user details");
        }

        const payload = (await response.json()) as DrawerDetailsResponse;

        if (!cancelled) {
          setDrawerDetails(payload);
        }
      } catch (error) {
        if (!cancelled) {
          setActionError(error instanceof Error ? error.message : "Failed to load drawer data");
        }
      } finally {
        if (!cancelled) {
          setDrawerLoading(false);
        }
      }
    };

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [selectedUserId]);

  const postJson = async (url: string, payload: unknown, method = "POST") => {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? "Request failed");
    }
  };

  const handleInviteUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionError(null);
    setIsSubmittingInvite(true);

    try {
      await postJson("/api/admin/users/invite", inviteForm);
      setInviteOpen(false);
      setInviteForm({
        fullName: "",
        email: "",
        role: "manager",
        companyId: companies.find((company) => company.isActive)?.id ?? companies[0]?.id ?? "",
        password: ""
      });
      router.refresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to invite user");
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleCreateCompany = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionError(null);
    setIsSubmittingCompany(true);

    try {
      await postJson("/api/admin/companies", companyForm);
      setCompanyCreateOpen(false);
      setCompanyForm({ name: "", phone: "" });
      router.refresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to create company");
    } finally {
      setIsSubmittingCompany(false);
    }
  };

  const handleToggleUserStatus = async (user: AdminUserRow) => {
    setActionError(null);
    setIsMutatingUsers(true);
    try {
      const nextStatus: UserStatus = user.status === "Active" ? "Suspended" : "Active";
      await postJson(`/api/admin/users/${user.id}/status`, { status: nextStatus });
      router.refresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to update user status");
    } finally {
      setIsMutatingUsers(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setActionError(null);
    setIsMutatingUsers(true);
    try {
      await postJson(`/api/admin/users/${userId}`, {}, "DELETE");
      setSelectedUserId((prev) => (prev === userId ? null : prev));
      setSelectedIds((prev) => prev.filter((id) => id !== userId));
      router.refresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to delete user");
    } finally {
      setIsMutatingUsers(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) {
      return;
    }

    setActionError(null);
    setIsMutatingUsers(true);
    try {
      await postJson(`/api/admin/users/${selectedUser.id}`, editForm, "PATCH");
      setIsEditMode(false);
      router.refresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to update user");
    } finally {
      setIsMutatingUsers(false);
    }
  };

  const handleBulkSuspend = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    setActionError(null);
    setIsMutatingUsers(true);
    try {
      await postJson("/api/admin/users/suspend-bulk", { userIds: selectedIds });
      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to suspend selected users");
    } finally {
      setIsMutatingUsers(false);
    }
  };

  const handleExportSelected = () => {
    const exportRows = filteredUsers.filter((user) => selectedIds.includes(user.id));

    if (exportRows.length === 0) {
      return;
    }

    const header = ["Full Name", "Email", "Role", "Plan", "Status", "Joined", "Last Active"];
    const rows = exportRows.map((user) => [
      user.fullName,
      user.email,
      user.role,
      user.plan,
      user.status,
      formatDate(user.joinedAt),
      formatDate(user.lastActiveAt)
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "selected-users.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleCompanyStatus = async (company: AdminCompanyOption) => {
    setActionError(null);
    setIsMutatingCompanies(true);
    try {
      await postJson(`/api/admin/companies/${company.id}/status`, { isActive: !company.isActive });
      router.refresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to update company status");
    } finally {
      setIsMutatingCompanies(false);
    }
  };

  const handleUpdateCompany = async () => {
    if (!selectedCompany) {
      return;
    }

    setActionError(null);
    setIsMutatingCompanies(true);
    try {
      await postJson(`/api/admin/companies/${selectedCompany.id}/status`, {
        isActive: companyEditForm.status === "Active"
      });
      setIsCompanyEditMode(false);
      router.refresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to update company");
    } finally {
      setIsMutatingCompanies(false);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    setActionError(null);
    setIsMutatingCompanies(true);
    try {
      await postJson(`/api/admin/companies/${companyId}`, {}, "DELETE");
      setSelectedCompanyId((prev) => (prev === companyId ? null : prev));
      setSelectedCompanyIds((prev) => prev.filter((id) => id !== companyId));
      router.refresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to delete company");
    } finally {
      setIsMutatingCompanies(false);
    }
  };

  const handleBulkDeactivateCompanies = async () => {
    if (selectedCompanyIds.length === 0) {
      return;
    }

    setActionError(null);
    setIsMutatingCompanies(true);
    try {
      for (const companyId of selectedCompanyIds) {
        const company = companies.find((item) => item.id === companyId);
        if (company?.isActive) {
          await postJson(`/api/admin/companies/${companyId}/status`, { isActive: false });
        }
      }
      setSelectedCompanyIds([]);
      router.refresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to update selected companies");
    } finally {
      setIsMutatingCompanies(false);
    }
  };

  const handleExportSelectedCompanies = () => {
    const exportRows = filteredCompanies.filter((company) => selectedCompanyIds.includes(company.id));

    if (exportRows.length === 0) {
      return;
    }

    const header = ["Company", "Phone", "Status", "Created", "Updated"];
    const rows = exportRows.map((company) => [
      company.name,
      company.phone,
      company.isActive ? "Active" : "Inactive",
      formatDate(company.createdAt),
      formatDate(company.updatedAt)
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "selected-companies.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="saas-shell">
      <aside className={`saas-sidebar ${mobileMenuOpen ? "is-open" : ""}`}>
        <div className="saas-brand">
          <div className="saas-brand-logo">AM</div>
          <div>
            <p className="saas-brand-title">Build Control</p>
            <p className="saas-brand-sub">AdminPanel</p>
          </div>
        </div>

        <nav className="saas-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`saas-nav-item ${activeNav === item.key ? "is-active" : ""}`}
              type="button"
              onClick={() => {
                setActiveNav(item.key);
                setMobileMenuOpen(false);
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="saas-main">
        <header className="saas-header">
          <button
            type="button"
            className="saas-mobile-menu"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            ☰
          </button>

          <input
            className="saas-header-search"
            placeholder={activeNav === "companies" ? "Search companies..." : "Search users..."}
            value={activeNav === "companies" ? companyQuery : query}
            onChange={(event) =>
              activeNav === "companies"
                ? setCompanyQuery(event.target.value)
                : setQuery(event.target.value)
            }
          />

          <div className="saas-header-right">
            <button type="button" className="saas-icon-btn" aria-label="Notifications">
              🔔
            </button>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="btn btn-ghost">
                Logout
              </button>
            </form>
            <div className="saas-admin-chip">
              <div className="saas-admin-avatar">{initialsFromName(currentUserName)}</div>
              <div>
                <p className="saas-admin-name">{currentUserName}</p>
                <p className="saas-admin-role" style={{ textTransform: "capitalize" }}>{currentUserRole}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="saas-content">
          {activeNav === "dashboard" ? (
            <>
              <div className="users-title-row">
                <h1>Dashboard</h1>
                <span className="users-count-badge">Live overview</span>
              </div>

              <div className="dashboard-cards">
                <article className="dashboard-card card-blue">
                  <p>Users</p>
                  <strong>{dashboardStats.usersTotal}</strong>
                </article>
                <article className="dashboard-card card-gray">
                  <p>Active users</p>
                  <strong>{dashboardStats.activeUsers}</strong>
                </article>
                <article className="dashboard-card card-orange">
                  <p>Suspended users</p>
                  <strong>{dashboardStats.suspendedUsers}</strong>
                </article>
              </div>

              <div className="dashboard-grid">
                <article className="panel dashboard-widget">
                  <h3>Monthly user signups</h3>
                  <div className="bar-chart">
                    {[22, 31, 27, 35, 29, 38, 41].map((value, index) => (
                      <div key={index} className="bar-item">
                        <span style={{ height: `${value * 2}px` }} />
                      </div>
                    ))}
                  </div>
                </article>

                <article className="panel dashboard-widget">
                  <h3>Activity trend</h3>
                  <svg viewBox="0 0 260 120" className="line-chart" role="img" aria-label="Activity trend chart">
                    <polyline
                      fill="none"
                      stroke="#2d6ec2"
                      strokeWidth="4"
                      points="0,90 35,70 70,74 105,52 140,65 175,45 210,55 245,30"
                    />
                  </svg>
                </article>

                <article className="panel dashboard-widget">
                  <h3>Plan distribution</h3>
                  <div className="pie-wrap">
                    <div className="pie-chart" />
                    <ul>
                      <li>Enterprise: {dashboardStats.enterpriseUsers}</li>
                      <li>Pro: {users.filter((user) => user.plan === "Pro").length}</li>
                      <li>Free: {users.filter((user) => user.plan === "Free").length}</li>
                    </ul>
                  </div>
                </article>
              </div>
            </>
          ) : activeNav === "companies" ? (
            <>
              <div className="users-title-row">
                <h1>Companies</h1>
                <span className="users-count-badge">{companies.length} companies</span>
              </div>

              <div className="users-toolbar">
                <input
                  className="users-filter-input"
                  placeholder="Search by company name or phone"
                  value={companyQuery}
                  onChange={(event) => setCompanyQuery(event.target.value)}
                />

                <select
                  value={companyStatusFilter}
                  onChange={(event) => setCompanyStatusFilter(event.target.value as CompanyStatus | "All")}
                >
                  <option value="All">Status: All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <button type="button" className="btn btn-primary" onClick={() => setCompanyCreateOpen(true)}>
                  Create
                </button>
              </div>

              {companyCreateOpen ? (
                <div className="modal-layer" onClick={() => setCompanyCreateOpen(false)}>
                  <form
                    className="panel modal-card"
                    onSubmit={handleCreateCompany}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="users-title-row">
                      <h3>Create company</h3>
                      <button type="button" className="btn btn-ghost" onClick={() => setCompanyCreateOpen(false)}>
                        Close
                      </button>
                    </div>
                    <div className="modal-form-vertical" style={{ marginTop: "0.7rem" }}>
                      <input
                        className="users-filter-input"
                        placeholder="Company name"
                        value={companyForm.name}
                        onChange={(event) =>
                          setCompanyForm((prev) => ({
                            ...prev,
                            name: event.target.value
                          }))
                        }
                        required
                      />
                      <input
                        className="users-filter-input"
                        placeholder="Phone"
                        value={companyForm.phone}
                        onChange={(event) =>
                          setCompanyForm((prev) => ({
                            ...prev,
                            phone: event.target.value
                          }))
                        }
                        required
                      />
                      <button className="btn btn-primary" type="submit" disabled={isSubmittingCompany}>
                        {isSubmittingCompany ? "Creating..." : "Create"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              {actionError ? (
                <p style={{ color: "#bf3f47", marginTop: "0.6rem", marginBottom: 0 }}>{actionError}</p>
              ) : null}

              {selectedCompanyIds.length > 0 ? (
                <div className="users-bulk-bar">
                  <p>{selectedCompanyIds.length} selected</p>
                  <div className="cta-row" style={{ marginTop: 0 }}>
                    <button type="button" className="btn btn-ghost" onClick={handleExportSelectedCompanies}>
                      Export selected
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={handleBulkDeactivateCompanies}
                      disabled={isMutatingCompanies}
                    >
                      Deactivate selected
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="users-table-wrap">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          aria-label="Select all companies"
                          type="checkbox"
                          checked={allVisibleCompaniesSelected}
                          onChange={toggleSelectAllCompanies}
                        />
                      </th>
                      <th>Company</th>
                      <th>Users</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.map((company) => {
                      const selected = selectedCompanyIds.includes(company.id);
                      const companyUsersCount = users.filter((user) => user.companyId === company.id).length;

                      return (
                        <tr key={company.id} onClick={() => setSelectedCompanyId(company.id)}>
                          <td onClick={(event) => event.stopPropagation()}>
                            <input
                              aria-label={`Select ${company.name}`}
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleSelectCompany(company.id)}
                            />
                          </td>
                          <td>
                            <div>
                              <p className="user-name">{company.name}</p>
                              <p className="user-email">{company.phone}</p>
                            </div>
                          </td>
                          <td>{companyUsersCount}</td>
                          <td>
                            <span className={`status-pill ${company.isActive ? "status-active" : "status-inactive"}`}>
                              {company.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>{formatDate(company.createdAt)}</td>
                          <td>{formatDate(company.updatedAt)}</td>
                          <td onClick={(event) => event.stopPropagation()}>
                            <details className="actions-menu">
                              <summary>⋯</summary>
                              <ul>
                                <li>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedCompanyId(company.id);
                                      setIsCompanyEditMode(false);
                                    }}
                                  >
                                    View company
                                  </button>
                                </li>
                                <li>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedCompanyId(company.id);
                                      setIsCompanyEditMode(true);
                                    }}
                                  >
                                    Edit
                                  </button>
                                </li>
                                <li>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleCompanyStatus(company)}
                                    disabled={isMutatingCompanies}
                                  >
                                    {company.isActive ? "Deactivate" : "Activate"}
                                  </button>
                                </li>
                                <li>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCompany(company.id)}
                                    disabled={isMutatingCompanies}
                                  >
                                    Delete
                                  </button>
                                </li>
                              </ul>
                            </details>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="users-mobile-list">
                {filteredCompanies.map((company) => (
                  <article
                    key={company.id}
                    className="users-mobile-card"
                    onClick={() => setSelectedCompanyId(company.id)}
                  >
                    <div>
                      <p className="user-name">{company.name}</p>
                      <p className="user-email">{company.phone}</p>
                    </div>
                    <div className="users-mobile-meta">
                      <span className={`status-pill ${company.isActive ? "status-active" : "status-inactive"}`}>
                        {company.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="user-email">Updated: {formatDate(company.updatedAt)}</p>
                  </article>
                ))}
              </div>
            </>
          ) : activeNav === "users" ? (
            <>
              <div className="users-title-row">
                <h1>Users</h1>
                <span className="users-count-badge">{users.length.toLocaleString()} users</span>
              </div>

              <div className="users-toolbar">
                <input
                  className="users-filter-input"
                  placeholder="Search by name or email"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />

                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as UserStatus | "All")}>
                  <option value="All">Status: All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>

                <select value={planFilter} onChange={(event) => setPlanFilter(event.target.value as UserPlan | "All")}>
                  <option value="All">Plan: All</option>
                  <option value="Free">Free</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>

                <select
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value as "All" | "Last30" | "Last180")}
                >
                  <option value="All">Date joined: All</option>
                  <option value="Last30">Last 30 days</option>
                  <option value="Last180">Last 180 days</option>
                </select>

                <button type="button" className="btn btn-primary" onClick={() => setInviteOpen(true)}>
                  Create
                </button>
              </div>

              {inviteOpen ? (
                <div className="modal-layer" onClick={() => setInviteOpen(false)}>
                  <form
                    className="panel modal-card"
                    onSubmit={handleInviteUser}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="users-title-row">
                      <h3>Create user</h3>
                      <button type="button" className="btn btn-ghost" onClick={() => setInviteOpen(false)}>
                        Close
                      </button>
                    </div>
                    <div className="modal-form-vertical" style={{ marginTop: "0.7rem" }}>
                      <input
                        className="users-filter-input"
                        placeholder="Full name"
                        value={inviteForm.fullName}
                        onChange={(event) =>
                          setInviteForm((prev) => ({
                            ...prev,
                            fullName: event.target.value
                          }))
                        }
                        required
                      />
                      <input
                        className="users-filter-input"
                        type="email"
                        placeholder="Email"
                        value={inviteForm.email}
                        onChange={(event) =>
                          setInviteForm((prev) => ({
                            ...prev,
                            email: event.target.value
                          }))
                        }
                        required
                      />
                      <select
                        value={inviteForm.role}
                        onChange={(event) =>
                          setInviteForm((prev) => ({
                            ...prev,
                            role: event.target.value as InviteRole
                          }))
                        }
                      >
                        <option value="manager">Manager</option>
                        <option value="foreman">Foreman</option>
                        <option value="worker">Worker</option>
                        <option value="admin">Admin</option>
                      </select>
                      <select
                        value={inviteForm.companyId}
                        onChange={(event) =>
                          setInviteForm((prev) => ({
                            ...prev,
                            companyId: event.target.value
                          }))
                        }
                      >
                        {companies
                          .filter((company) => company.isActive)
                          .map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.name}
                            </option>
                          ))}
                      </select>
                      <input
                        className="users-filter-input"
                        type="password"
                        minLength={8}
                        placeholder="Temporary password"
                        value={inviteForm.password}
                        onChange={(event) =>
                          setInviteForm((prev) => ({
                            ...prev,
                            password: event.target.value
                          }))
                        }
                        required
                      />
                      <button className="btn btn-primary" type="submit" disabled={isSubmittingInvite}>
                        {isSubmittingInvite ? "Creating..." : "Create"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              {actionError ? (
                <p style={{ color: "#bf3f47", marginTop: "0.6rem", marginBottom: 0 }}>{actionError}</p>
              ) : null}

              {selectedIds.length > 0 ? (
                <div className="users-bulk-bar">
                  <p>{selectedIds.length} selected</p>
                  <div className="cta-row" style={{ marginTop: 0 }}>
                    <button type="button" className="btn btn-ghost" onClick={handleExportSelected}>
                      Export selected
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={handleBulkSuspend}
                      disabled={isMutatingUsers}
                    >
                      Suspend selected
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="users-table-wrap">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          aria-label="Select all users"
                          type="checkbox"
                          checked={allVisibleSelected}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th>User</th>
                      <th>Plan</th>
                      <th>Status</th>
                      <th>Joined date</th>
                      <th>Last active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const selected = selectedIds.includes(user.id);

                      return (
                        <tr key={user.id} onClick={() => setSelectedUserId(user.id)}>
                          <td onClick={(event) => event.stopPropagation()}>
                            <input
                              aria-label={`Select ${user.fullName}`}
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleSelectOne(user.id)}
                            />
                          </td>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar">{initialsFromName(user.fullName)}</div>
                              <div>
                                <p className="user-name">{user.fullName}</p>
                                <p className="user-email">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`plan-badge plan-${user.plan.toLowerCase()}`}>{user.plan}</span>
                          </td>
                          <td>
                            <span className={`status-pill status-${user.status.toLowerCase()}`}>{user.status}</span>
                          </td>
                          <td>{formatDate(user.joinedAt)}</td>
                          <td>{formatDate(user.lastActiveAt)}</td>
                          <td onClick={(event) => event.stopPropagation()}>
                            <details className="actions-menu">
                              <summary>⋯</summary>
                              <ul>
                                <li>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedUserId(user.id);
                                      setIsEditMode(false);
                                      setActiveDrawerTab("overview");
                                    }}
                                  >
                                    View profile
                                  </button>
                                </li>
                                <li>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedUserId(user.id);
                                      setIsEditMode(true);
                                      setActiveDrawerTab("overview");
                                    }}
                                  >
                                    Edit
                                  </button>
                                </li>
                                <li>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleUserStatus(user)}
                                    disabled={isMutatingUsers}
                                  >
                                    {user.status === "Active" ? "Suspend" : "Activate"}
                                  </button>
                                </li>
                                <li>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={isMutatingUsers}
                                  >
                                    Delete
                                  </button>
                                </li>
                              </ul>
                            </details>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="users-mobile-list">
                {filteredUsers.map((user) => (
                  <article
                    key={user.id}
                    className="users-mobile-card"
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <div className="user-cell">
                      <div className="user-avatar">{initialsFromName(user.fullName)}</div>
                      <div>
                        <p className="user-name">{user.fullName}</p>
                        <p className="user-email">{user.email}</p>
                      </div>
                    </div>
                    <div className="users-mobile-meta">
                      <span className={`plan-badge plan-${user.plan.toLowerCase()}`}>{user.plan}</span>
                      <span className={`status-pill status-${user.status.toLowerCase()}`}>{user.status}</span>
                    </div>
                    <p className="user-email">Joined: {formatDate(user.joinedAt)}</p>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="panel" style={{ marginTop: "1rem" }}>
              <h2>{navItems.find((item) => item.key === activeNav)?.label}</h2>
              <p style={{ marginTop: "0.5rem", color: "#58697f" }}>
                Select Users to manage user accounts.
              </p>
            </div>
          )}
        </section>
      </div>

      <aside className={`user-drawer ${selectedUser || selectedCompany ? "is-open" : ""}`}>
        {selectedUser ? (
          <>
            <div className="user-drawer-close-row">
              <button
                type="button"
                className="user-drawer-close"
                aria-label="Close user details"
                onClick={() => setSelectedUserId(null)}
              >
                x
              </button>
            </div>

            <div className="user-drawer-head">
              <div className="user-avatar large">{initialsFromName(selectedUser.fullName)}</div>
              <div>
                <h3>{selectedUser.fullName}</h3>
                <p className="user-email">{selectedUser.email}</p>
                <p className="user-email">{selectedUser.role}</p>
              </div>
            </div>

            <div className="user-drawer-tabs">
              <button
                type="button"
                className={activeDrawerTab === "overview" ? "is-active" : ""}
                onClick={() => {
                  setIsEditMode(false);
                  setActiveDrawerTab("overview");
                }}
              >
                Overview
              </button>
              <button
                type="button"
                className={activeDrawerTab === "activity" ? "is-active" : ""}
                onClick={() => {
                  setIsEditMode(false);
                  setActiveDrawerTab("activity");
                }}
              >
                Activity
              </button>
              <button
                type="button"
                className={activeDrawerTab === "billing" ? "is-active" : ""}
                onClick={() => {
                  setIsEditMode(false);
                  setActiveDrawerTab("billing");
                }}
              >
                Billing
              </button>
            </div>

            <div className="user-drawer-body">
              {drawerLoading ? (
                <p>Loading...</p>
              ) : isEditMode ? (
                <div className="drawer-edit-grid">
                  <label>
                    Full name
                    <input
                      value={editForm.fullName}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          fullName: event.target.value
                        }))
                      }
                    />
                  </label>

                  <label>
                    Role
                    <select
                      value={editForm.role}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          role: event.target.value as InviteRole
                        }))
                      }
                    >
                      <option value="manager">Manager</option>
                      <option value="foreman">Foreman</option>
                      <option value="worker">Worker</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>

                  <label>
                    Company
                    <select
                      value={editForm.companyId}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          companyId: event.target.value
                        }))
                      }
                    >
                      {companies
                        .filter((company) => company.isActive)
                        .map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.name}
                          </option>
                        ))}
                    </select>
                  </label>

                  <label>
                    Status
                    <select
                      value={editForm.status}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          status: event.target.value as UserStatus
                        }))
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </label>
                </div>
              ) : (
                activeDrawerTab === "overview" ? (
                  <>
                    <p>
                      <strong>Account status:</strong> {drawerDetails?.overview.status ?? selectedUser.status}
                    </p>
                    <p>
                      <strong>Plan type:</strong> {drawerDetails?.billing.plan ?? selectedUser.plan}
                    </p>
                    <p>
                      <strong>Join date:</strong>{" "}
                      {formatDate(drawerDetails?.overview.joinedAt ?? selectedUser.joinedAt)}
                    </p>
                    <p>
                      <strong>Last login:</strong>{" "}
                      {formatDate(drawerDetails?.overview.lastLogin ?? selectedUser.lastActiveAt)}
                    </p>
                    <p>
                      <strong>Total sessions:</strong>{" "}
                      {drawerDetails?.overview.totalSessions ?? Math.max(5, selectedUser.id.length * 3)}
                    </p>
                  </>
                ) : activeDrawerTab === "activity" ? (
                  <div className="drawer-list">
                    {(drawerDetails?.activity ?? []).map((item) => (
                      <article key={item.id} className="drawer-list-item">
                        <p style={{ margin: 0 }}>
                          <strong>{item.action}</strong>
                        </p>
                        <p style={{ margin: "0.2rem 0", color: "#627890" }}>{item.details ?? "No details"}</p>
                        <p className="user-email">{formatDate(item.createdAt)}</p>
                      </article>
                    ))}
                    {(drawerDetails?.activity?.length ?? 0) === 0 ? <p>No activity yet.</p> : null}
                  </div>
                ) : (
                  <div className="drawer-list">
                    <p>
                      <strong>Plan:</strong> {drawerDetails?.billing.plan ?? selectedUser.plan}
                    </p>
                    <p>
                      <strong>Monthly amount:</strong> {drawerDetails?.billing.currency ?? "USD"} {drawerDetails?.billing.monthlyAmount ?? 0}
                    </p>
                    <p>
                      <strong>Renewal date:</strong>{" "}
                      {drawerDetails?.billing.renewalDate
                        ? formatDate(drawerDetails.billing.renewalDate)
                        : "Not set"}
                    </p>
                    <p>
                      <strong>Payment status:</strong> {drawerDetails?.billing.paymentStatus ?? "Unknown"}
                    </p>
                  </div>
                )
              )}
            </div>

            <div className="cta-row">
              {isEditMode ? (
                <>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleUpdateUser}
                    disabled={isMutatingUsers}
                  >
                    Save changes
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setIsEditMode(false)}>
                    Cancel
                  </button>
                </>
              ) : (
                <button type="button" className="btn btn-primary" onClick={() => setIsEditMode(true)}>
                  Edit user
                </button>
              )}
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleToggleUserStatus(selectedUser)}
                disabled={isMutatingUsers}
              >
                {selectedUser.status === "Active" ? "Suspend account" : "Activate account"}
              </button>
            </div>
          </>
        ) : selectedCompany ? (
          <>
            <div className="user-drawer-close-row">
              <button
                type="button"
                className="user-drawer-close"
                aria-label="Close company details"
                onClick={() => setSelectedCompanyId(null)}
              >
                x
              </button>
            </div>

            <div className="user-drawer-head">
              <div className="user-avatar large">{initialsFromName(selectedCompany.name)}</div>
              <div>
                <h3>{selectedCompany.name}</h3>
                <p className="user-email">{selectedCompany.phone}</p>
                <p className="user-email">{selectedCompany.isActive ? "Active" : "Inactive"}</p>
              </div>
            </div>

            <div className="user-drawer-body">
              {isCompanyEditMode ? (
                <div className="drawer-edit-grid">
                  <label>
                    Status
                    <select
                      value={companyEditForm.status}
                      onChange={(event) =>
                        setCompanyEditForm((prev) => ({
                          ...prev,
                          status: event.target.value as CompanyStatus
                        }))
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </label>
                </div>
              ) : (
                <>
                  <p>
                    <strong>Account status:</strong> {selectedCompany.isActive ? "Active" : "Inactive"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedCompany.phone}
                  </p>
                  <p>
                    <strong>Total users:</strong>{" "}
                    {users.filter((user) => user.companyId === selectedCompany.id).length}
                  </p>
                  <p>
                    <strong>Created:</strong> {formatDate(selectedCompany.createdAt)}
                  </p>
                  <p>
                    <strong>Updated:</strong> {formatDate(selectedCompany.updatedAt)}
                  </p>
                </>
              )}
            </div>

            <div className="cta-row">
              {isCompanyEditMode ? (
                <>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleUpdateCompany}
                    disabled={isMutatingCompanies}
                  >
                    Save changes
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setIsCompanyEditMode(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setIsCompanyEditMode(true)}
                >
                  Edit company
                </button>
              )}
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleToggleCompanyStatus(selectedCompany)}
                disabled={isMutatingCompanies}
              >
                {selectedCompany.isActive ? "Deactivate company" : "Activate company"}
              </button>
            </div>
          </>
        ) : (
          <p style={{ color: "#687b91" }}>Select a user or company to open details.</p>
        )}
      </aside>

      {mobileMenuOpen ? <button className="saas-overlay" onClick={() => setMobileMenuOpen(false)} /> : null}
      {selectedUser || selectedCompany ? (
        <button
          className="drawer-overlay"
          onClick={() => {
            setSelectedUserId(null);
            setSelectedCompanyId(null);
          }}
        />
      ) : null}
    </div>
  );
}
