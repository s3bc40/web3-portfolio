"use client";

/**
 * TechStackItem component
 * @description A component that displays a technology stack item with an icon and label.
 * @param {string} label - The label of the technology.
 * @param {React.ReactNode} icon - The icon of the technology.
 * @returns {JSX.Element} The rendered TechStackItem component.
 */
export default function TechStackItem({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      key={label}
      className="group relative flex cursor-pointer flex-col items-center transition-all duration-200 select-none hover:scale-110 active:scale-110"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 opacity-0 blur transition-opacity duration-200 group-hover:opacity-100 group-active:opacity-100"></div>
      <span className="relative flex h-20 w-20 items-center justify-center rounded-lg bg-gray-800 p-4 shadow-inner">
        {icon}
      </span>
      <span className="relative mt-2 text-lg font-medium text-gray-300">
        {label}
      </span>
    </div>
  );
}
