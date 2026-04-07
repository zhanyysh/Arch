export type UserRole = "admin" | "manager" | "foreman" | "worker";

export type ProjectStatus =
  | "planned"
  | "in_progress"
  | "review"
  | "completed"
  | "frozen";

export type StageStatus =
  | "not_started"
  | "in_progress"
  | "review"
  | "done"
  | "overdue";

export type TaskStatus = "new" | "in_progress" | "review" | "done" | "rework";

export interface Company {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  companyId: string;
  isActive: boolean;
}

export interface Project {
  id: string;
  companyId: string;
  title: string;
  description: string;
  startsAt: string;
  dueAt: string;
  foremanId: string;
  status: ProjectStatus;
}

export interface Stage {
  id: string;
  projectId: string;
  title: string;
  startsAt: string;
  dueAt: string;
  status: StageStatus;
  order: number;
}

export interface Task {
  id: string;
  projectId: string;
  stageId: string;
  workerId: string;
  assigneeRole: "worker";
  title: string;
  status: TaskStatus;
  requiresAfterPhoto: true;
}

export interface PhotoReport {
  id: string;
  taskId: string;
  kind: "before" | "after";
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  attempt: number;
}
