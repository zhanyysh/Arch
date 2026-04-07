"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ label, fallbackHref }: { label: string; fallbackHref: string }) {
  const router = useRouter();

  return (
    <button 
      className="btn btn-ghost" 
      onClick={(e) => {
        e.preventDefault();
        // Uses native browser back to prevent infinite history loops
        if (window.history.length > 2) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
    >
      {label}
    </button>
  );
}
