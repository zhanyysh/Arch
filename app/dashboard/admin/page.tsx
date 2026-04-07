import { listAdminData } from "@/lib/admin-service";
import { requireSession } from "@/lib/auth";
import {
  type AdminCompanyOption,
  type AdminUserRow,
  default as AdminPanelClient
} from "@/app/dashboard/admin/AdminPanelClient";

export default async function AdminDashboardPage() {
  const session = await requireSession();
  const { users, companies } = await listAdminData();

  const uiCompanies: AdminCompanyOption[] = companies.map((company) => ({
    id: company.id,
    name: company.name,
    phone: company.phone,
    isActive: company.isActive,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString()
  }));

  const uiUsers: AdminUserRow[] = users.map((user) => {
    const plan =
      user.role === "admin" ? "Enterprise" : user.role === "manager" || user.role === "foreman" ? "Pro" : "Free";

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      companyName: user.company.name,
      joinedAt: user.createdAt.toISOString(),
      lastActiveAt: user.updatedAt.toISOString(),
      status: user.isActive ? "Active" : "Suspended",
      plan
    };
  });

  return (
    <AdminPanelClient
      users={uiUsers}
      companies={uiCompanies}
      currentUserName={session.fullName}
      currentUserRole={session.role}
    />
  );
}
