"use client";

import { useRouter } from "next/navigation";

export default function StageCard({
  projectId,
  stageId,
  children
}: {
  projectId: string;
  stageId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div
      className="stage-card"
      onClick={(e) => {
        let current: HTMLElement | null = e.target as HTMLElement;
        while (current && current !== e.currentTarget) {
          const tag = current.tagName?.toUpperCase();
          if (
            tag === "BUTTON" ||
            tag === "SELECT" ||
            tag === "OPTION" ||
            tag === "INPUT" ||
            tag === "A" ||
            tag === "FORM"
          ) {
            return;
          }
          current = current.parentElement;
        }
        router.push(`/projects/${projectId}/stages/${stageId}`);
      }}
    >
      {children}
    </div>
  );
}