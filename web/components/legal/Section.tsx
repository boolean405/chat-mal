// components/legal/Section.tsx
import React from "react";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function Section({ title, children }: Props) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
        {children}
      </div>
    </section>
  );
}
