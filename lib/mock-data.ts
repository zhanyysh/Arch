import type { Company, Project, Stage, Task, User } from "@/lib/domain";

export const companies: Company[] = [
  {
    id: "cmp_ak_build",
    name: "AK Build Group",
    phone: "0777 77 77 77",
    isActive: true
  }
];

export const users: User[] = [
  {
    id: "usr_admin_1",
    fullName: "Айбек Асанов",
    email: "admin@build-control.local",
    role: "admin",
    companyId: "cmp_ak_build",
    isActive: true
  },
  {
    id: "usr_manager_1",
    fullName: "Эльвира Токтогулова",
    email: "manager@build-control.local",
    role: "manager",
    companyId: "cmp_ak_build",
    isActive: true
  },
  {
    id: "usr_foreman_1",
    fullName: "Руслан Мамытов",
    email: "foreman@build-control.local",
    role: "foreman",
    companyId: "cmp_ak_build",
    isActive: true
  },
  {
    id: "usr_worker_1",
    fullName: "Нурлан Осмонов",
    email: "worker@build-control.local",
    role: "worker",
    companyId: "cmp_ak_build",
    isActive: true
  }
];

export const projects: Project[] = [
  {
    id: "prj_001",
    companyId: "cmp_ak_build",
    title: "ЖК Skyline Residence",
    description: "12-этажный жилой комплекс в Бишкеке",
    startsAt: "2026-04-01",
    dueAt: "2026-12-20",
    foremanId: "usr_foreman_1",
    status: "in_progress"
  }
];

export const stages: Stage[] = [
  {
    id: "stg_001",
    projectId: "prj_001",
    title: "Фундамент",
    startsAt: "2026-04-01",
    dueAt: "2026-05-01",
    status: "in_progress",
    order: 1
  },
  {
    id: "stg_002",
    projectId: "prj_001",
    title: "Монолитный каркас",
    startsAt: "2026-05-02",
    dueAt: "2026-07-01",
    status: "not_started",
    order: 2
  }
];

export const tasks: Task[] = [
  {
    id: "tsk_001",
    projectId: "prj_001",
    stageId: "stg_001",
    workerId: "usr_worker_1",
    assigneeRole: "worker",
    title: "Подготовить опалубку секции A",
    status: "in_progress",
    requiresAfterPhoto: true
  }
];
