"use client";

import { useRouter } from "next/navigation";

export default function ProjectTableRow({
  projectId,
  children
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <tr
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
        router.push(`/projects/${projectId}/stages`);
      }}
      style={{ cursor: "pointer", transition: "background-color 0.15s ease" }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.02)")}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      {children}
    </tr>
  );
}