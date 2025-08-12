import type React from "react";

export function HoverComponent({
  children,
  label,
  subLabel,
}: {
  children: React.ReactNode;
  label: string;
  subLabel?: string;
}) {
  return (
    <div className="relative group inline-block ">
      {children}
      <div className=" pointer-events-none absolute flex flex-col items-center justify-center left-1/2 top-10 mt-2 p-2 transform -translate-x-1/2 bg-gray-100 shadow-md opacity-0 group-hover:opacity-100 transition-opacity ">
        <div className="text-nowrap text-sm">{label}</div>

        {subLabel ? (
          <div className="text-gray-400 text-sm">{subLabel}</div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
