import { ReactNode } from "react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 bg-base-200/40 p-8 sm:p-12 text-center">
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-base-100 text-primary shadow-sm mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-base-content">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-base-content/65 leading-relaxed">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn btn-primary btn-sm rounded-xl mt-5">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
