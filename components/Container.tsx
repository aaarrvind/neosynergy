import { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-container px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
