import type { UserRole } from "@/lib/domain";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Администратор",
  manager: "Менеджер",
  foreman: "Прораб",
  worker: "Работник"
};

const roleRoutes: Record<UserRole, string> = {
  admin: "/dashboard/admin",
  manager: "/dashboard/manager",
  foreman: "/dashboard/foreman",
  worker: "/dashboard/worker"
};

export function getHomeByRole(role: UserRole): string {
  return roleRoutes[role];
}

export function canAccessRoute(role: UserRole, route: string): boolean {
  if (route.startsWith("/admin")) {
    return role === "admin";
  }

  if (route.startsWith("/projects")) {
    return role === "manager" || role === "foreman";
  }

  if (route.startsWith("/tasks")) {
    return role === "foreman" || role === "worker";
  }

  return true;
}
