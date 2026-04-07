import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";

export default async function DashboardIndexPage() {
  const session = await requireSession();
  redirect(`/dashboard/${session.role}`);
}
