"use client";

import { Body1, Body2 } from "@/ui/Typography";

type CardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

export function Card({ title, description, icon }: CardProps) {
  return (
    <div
      className="group flex max-h-80 min-h-40 max-w-lg flex-col gap-2 rounded-md bg-gray-800 p-6 shadow-md select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Icon */}
      <div>{icon}</div>
      {/* Title */}
      <Body1>{title}</Body1>
      {/* Description */}
      <Body2>{description}</Body2>
    </div>
  );
}
